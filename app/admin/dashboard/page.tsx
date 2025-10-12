"use client";

import React, { useState, useEffect } from 'react';
import { generatePDF, type PhotoData, type FormData as ExportForm } from '@/lib/export';
import { Search, Download, Eye, Calendar, MapPin, User, Building2, FileText, Image, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Report {
  id: string;
  reportId: string;
  status: 'Completed' | 'In Progress' | 'On Track' | '';
  inspectorName: string;
  clientName: string;
  companyName: string;
  location: string;
  inspectionDate: string;
  contactEmail: string;
  contactPhone: string;
  photoCount: number;
  createdAt: string;
  photos: Photo[];
}

interface Photo {
  id: string;
  url: string;
  caption: string;
  section: string;
}

const AdminDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const reportsPerPage = 10;

  // Fetch reports from your backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/reports');
        const data = await response.json();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Search and filter logic
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.inspectionDate);
        const diffTime = Math.abs(now.getTime() - reportDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch(dateFilter) {
          case '7days': return diffDays <= 7;
          case '30days': return diffDays <= 30;
          case '90days': return diffDays <= 90;
          default: return true;
        }
      });
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, reports]);

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const currentReports = filteredReports.slice(startIndex, startIndex + reportsPerPage);

  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'Completed').length,
    inProgress: reports.filter(r => r.status === 'In Progress').length,
    onTrack: reports.filter(r => r.status === 'On Track').length,
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'On Track': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadPDF = async (report: Report) => {
    try {
      const response = await fetch(`/api/admin/download-pdf/${report.id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to fetch report data (${response.status})`);
      const data = await response.json();

      const form: ExportForm = {
        reportId: data.report?.reportId || report.reportId,
        status: data.report?.status || report.status,
        inspectorName: data.report?.inspectorName || report.inspectorName,
        clientName: data.report?.clientName || report.clientName,
        companyName: data.report?.companyName || report.companyName,
        location: data.report?.location || report.location,
        streetAddress: data.report?.streetAddress || '',
        city: data.report?.city || '',
        state: data.report?.state || '',
        country: data.report?.country || '',
        zipCode: data.report?.zipCode || '',
        inspectionDate: data.report?.inspectionDate || report.inspectionDate,
        startInspectionTime: data.report?.startInspectionTime || '',
        contactEmail: data.report?.contactEmail || report.contactEmail,
        contactPhone: data.report?.contactPhone || report.contactPhone,
        workProgress: data.report?.workProgress || '',
        safetyCompliance: data.report?.safetyCompliance || '',
        safetySignage: data.report?.safetySignage || '',
        scheduleCompliance: data.report?.scheduleCompliance || '',
        materialAvailability: data.report?.materialAvailability || '',
        workerAttendance: data.report?.workerAttendance || '',
        additionalComments: data.report?.additionalComments || '',
        inspectorSummary: data.report?.inspectorSummary || '',
        recommendations: data.report?.recommendations || '',
        temperature: data.report?.temperature || '',
        humidity: data.report?.humidity || '',
        windSpeed: data.report?.windSpeed || '',
        weatherDescription: data.report?.weatherDescription || '',
        backgroundManual: data.report?.backgroundManual || '',
        backgroundAuto: data.report?.backgroundAuto || '',
        fieldObservationText: data.report?.fieldObservationText || '',
        signatureData: data.report?.signatureData || '',
        lat: data.report?.lat || '',
        lon: data.report?.lon || '',
      };

      const photos: { [k: string]: PhotoData[] } = {
        background: [],
        fieldObservation: [],
        work: [],
        safety: [],
        equipment: [],
        additional: [],
      };

      for (const p of data.photos as Array<{ data?: string; name?: string; caption?: string; section?: string }>) {
        const section = p.section || 'fieldObservation';
        const entry: PhotoData = {
          name: p.name || 'photo',
          data: p.data || '',
          caption: p.caption || '',
        };
        if (!photos[section]) photos[section] = [];
        photos[section].push(entry);
      }

      await generatePDF(form, photos);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Inspection Reports Management</p>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">NineKiwi Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.inProgress}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">⋯</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Track</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.onTrack}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, inspector, client, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="On Track">On Track</option>
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{report.reportId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{report.inspectorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.clientName}</div>
                      <div className="text-xs text-gray-500">{report.companyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                        <span className="text-sm text-gray-900">{report.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.inspectionDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{report.photoCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(report)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(startIndex + reportsPerPage, filteredReports.length)}</span> of{' '}
              <span className="font-medium">{filteredReports.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Report ID</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.reportId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Inspector Name</label>
                  <p className="text-base text-gray-900 mt-1">{selectedReport.inspectorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Client Name</label>
                  <p className="text-base text-gray-900 mt-1">{selectedReport.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-base text-gray-900 mt-1">{selectedReport.companyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Inspection Date</label>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(selectedReport.inspectionDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-base text-gray-900 mt-1">{selectedReport.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Email</label>
                  <p className="text-base text-gray-900 mt-1">{selectedReport.contactEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                  <p className="text-base text-gray-900 mt-1">{selectedReport.contactPhone}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2" />
                  Inspection Photos ({selectedReport.photos.length})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {selectedReport.photos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative group cursor-pointer"
                      onClick={() => openPhotoModal(photo)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-40 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-gray-600 mt-2 text-center truncate">{photo.caption}</p>
                      <p className="text-xs text-gray-400 text-center capitalize">{photo.section}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDownloadPDF(selectedReport)}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download Full Report PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50" onClick={() => setShowPhotoModal(false)}>
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption}
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="bg-white p-4 rounded-b-lg">
              <p className="font-semibold text-gray-900">{selectedPhoto.caption}</p>
              <p className="text-sm text-gray-500 capitalize">Section: {selectedPhoto.section}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
