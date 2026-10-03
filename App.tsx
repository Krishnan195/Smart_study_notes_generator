import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { GeneratorView } from './components/GeneratorView';
import { TestRecordsView } from './components/TestRecordsView';
import { PythonCodeView } from './components/PythonCodeView';
import { ProjectReportView } from './components/ProjectReportView';
import { ActiveTab } from './types';
import { GraduationCap, Github, Terminal, Sparkles, Award } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'generator' && <GeneratorView />}
        {activeTab === 'test-records' && <TestRecordsView />}
        {activeTab === 'python-code' && <PythonCodeView />}
        {activeTab === 'project-report' && <ProjectReportView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Smart Study Notes Generator</span>
            <span>•</span>
            <span>Mini Project Submission</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generative AI (Transformers &amp; Gemini)</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>3 Test Evaluations Included</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
