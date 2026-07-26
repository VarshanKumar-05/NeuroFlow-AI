import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Settings as SettingsIcon, User, Bell, Monitor } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications'>('profile');

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-10 h-10 text-[#00E5FF]" />
          System Settings
        </h1>
        <p className="text-slate-500 text-lg mt-1 font-medium">Manage your account preferences and system configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <nav className="flex flex-row md:flex-col gap-2 min-w-[200px] overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Details
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'appearance' 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Appearance
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' 
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </nav>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your personal information and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-sm">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <Input defaultValue="Admin User" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <Input defaultValue="admin@neuroflow.ai" type="email" />
                </div>
                <div className="pt-4">
                  <Button className="bg-[#00E5FF] hover:bg-[#00d0e6] text-slate-900">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how NeuroFlow AI looks on your device.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button variant="outline" className="border-2 border-slate-200 dark:border-slate-700 w-32 h-24 flex flex-col gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-900"></span>
                    Light
                  </Button>
                  <Button variant="outline" className="border-2 border-[#00E5FF] dark:border-[#00E5FF] w-32 h-24 flex flex-col gap-2 bg-slate-950 hover:bg-slate-900 text-white hover:text-white">
                    <span className="w-4 h-4 rounded-full bg-white"></span>
                    Dark
                  </Button>
                </div>
                <p className="text-sm text-slate-500 mt-2">Currently using Dark mode theme by default for the command center.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what alerts you want to receive and how.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-medium text-slate-900 dark:text-white">Critical Incidents</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts for accidents and severe congestion.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-[#00E5FF]" defaultChecked />
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-medium text-slate-900 dark:text-white">Camera Offline</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when a video feed drops.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-[#00E5FF]" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-medium text-slate-900 dark:text-white">Weekly Reports</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive weekly traffic summary via email.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-[#00E5FF]" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
