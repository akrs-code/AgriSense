import React from 'react'; 
import { CheckCircle, Clock, XCircle, FileText, MapPin, Phone } from 'lucide-react'; 
import { useAuthStore } from '../../stores/authStore'; 
import { UserRole, VerificationStatus as StatusEnum } from '../../types/enums'; 
import { Seller } from '../../types/user/user.types'; 

export const VerificationStatus: React.FC = () => { 
    const { user } = useAuthStore(); 
    // Type guard to ensure 'user' is a Seller 

    const seller = user && user.role === UserRole.Seller ? (user as Seller) : null; 
    const isLocationVerified = seller?.verificationStatus === StatusEnum.Approved;

    const getStatusIcon = () => { 
      switch (seller?.verificationStatus) { 
        case StatusEnum.Approved: 
        return <CheckCircle className="text-green-500" size={64} />; 
        case StatusEnum.Rejected: 
        return <XCircle className="text-red-500" size={64} />; 
        default: return <Clock className="text-yellow-500" size={64} />; 
      } }; 
    const getStatusMessage = () => { 
      switch (seller?.verificationStatus) { 
        case StatusEnum.Approved: 
        return { 
          title: 'Verification Complete!', 
          message: 'Your farmer account has been verified. You can now start listing your products.', 
          color: 'text-green-900' }; 
        case StatusEnum.Rejected: 
        return { 
          title: 'Verification Rejected', 
          message: 'Your verification was rejected. Please review the feedback and resubmit.', 
          color: 'text-red-900' }; 
        default: return { 
          title: 'Verification Under Review', 
          message: 'Your verification documents are being reviewed by our team. This usually takes 1-3 business days.', 
          color: 'text-yellow-900' }; 
        } 
      }; 
      const status = getStatusMessage(); 
      return ( 
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4"> 
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full"> 
          <div className="text-center mb-8"> {getStatusIcon()} 
            <h2 className={`text-2xl font-bold ${status.color} mt-4 mb-2`}>
              {status.title}
            </h2> 
            <p className="text-gray-600">{status.message}</p> 
          </div> 
          <div className="bg-gray-50 rounded-xl p-6 mb-6"> 
            <h3 className="font-semibold text-gray-900 mb-4">Submitted Documents</h3> 
          <div className="space-y-3"> 

            {seller?.credentials?.documents && seller.credentials.documents.length > 0 ? 
            ( seller.credentials.documents.map((docUrl, index) => ( 
            <div key={index} className="flex items-center space-x-3"> 
            <FileText className="text-green-500" size={20} /> 
            <span className="text-gray-700">Document {index + 1}</span> 
            <span className="text-green-600 text-sm">✓ Uploaded</span> 
              </div> )) ) : 
            ( <p className="text-gray-500 text-sm">No documents have been submitted yet.</p> )} 
            <div className="flex items-center space-x-3"> 
            </div> 
          </div> 
        </div> 
         <div className="bg-blue-50 rounded-xl p-6 mb-6"> 
        <h3 className="font-semibold text-blue-900 mb-2">Farm Location</h3> 
        <p className="text-blue-800">{user?.location?.address || 'N/A'}</p> 
        <p className="text-blue-600 text-sm"> Coordinates: {user?.location?.lat?.toFixed(4) || 'N/A'}, 
          {user?.location?.lng?.toFixed(4) || 'N/A'} </p> </div> {/* Action Buttons */} 
          <div className="space-y-3"> 
            {seller?.verificationStatus === StatusEnum.Approved && (
               <button onClick={
                () => window.location.href = '/seller/dashboard'} 
                className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors" >
             Go to Dashboard </button> )} 
        {seller?.verificationStatus === StatusEnum.Rejected && ( 
          
      <div className="space-y-3"> 
      <button onClick={
        () => window.location.href = '/seller/verification'} 
        className="w-full bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors" > 
        Re-submit Documents 
      </button> 
      
      <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
         <Phone size={20} /> 
         <span>Contact Support</span> 
        </button> </div> )} 
        {seller?.verificationStatus === StatusEnum.Pending && ( 
          <div className="space-y-3"> <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"> 
          <p className="text-sm text-yellow-800"> We'll notify you via email and SMS once the review is complete. 
            </p> 
            </div> 
            <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"> 
          <Phone size={20} /> 
          <span>Contact Support</span> 
          </button> 
          </div> )} 
        </div> 
      </div> 
    </div> 
  ); };