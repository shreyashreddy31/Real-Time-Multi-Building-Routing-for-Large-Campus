import React from 'react';
import { Compass, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Meridian</span>
          </div>
          <p className="text-sm text-slate-400">
            Next-generation smart campus navigation system. Real-time routing, traffic management, and dynamic spatial awareness.
          </p>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/explore" className="hover:text-primary transition-colors">Explore Campus</Link></li>
            <li><Link to="/navigate" className="hover:text-primary transition-colors">Navigation</Link></li>
            <li><Link to="/places" className="hover:text-primary transition-colors">Campus Directory</Link></li>
            <li><Link to="/parking" className="hover:text-primary transition-colors">Parking Availability</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Emergency</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-danger" /> Campus Security: 1999</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-danger" /> Medical Center: 1998</li>
            <li><Link to="/emergency" className="text-danger hover:text-red-400 font-medium">Fast Dispatch Protocol &rarr;</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Contact Info</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Meridian Campus, New Delhi, 110016</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> help@meridian.edu</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} Meridian Smart Campus. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <span>Powered by React & FastAPI</span>
        </div>
      </div>
    </footer>
  );
}
