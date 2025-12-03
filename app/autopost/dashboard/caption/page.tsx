'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiLoader, FiEdit2, FiInfo, FiCpu, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import StepIndicator from '@/components/StepIndicator';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button2';
import { UserNavbar } from '@/components/UserNavbar';
import { cancelUploadWorkflow } from '@/lib/autopost/cancel-workflow';
import { getWorkflowSession, updateWorkflowSession, validateWorkflowStage } from '@/lib/autopost/workflow-session';
import type { WorkflowData } from "@/lib/autopost/workflow-session"

export default function CaptionPage() {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate session and required data
    const validation = validateWorkflowStage('caption');
    if (!validation.valid) {
      router.push('/autopost/dashboard/listing?connected=true');
      return;
    }

    const session = getWorkflowSession();
    if (session) {
      setWorkflow(session);
      setCaption(session.caption || '');
      setGeneratedCaption(session.generatedCaption || '');
    }
  }, [router]);

  const generateCaption = async () => {
    if (!workflow || workflow.imageUrls.length === 0) {
      setError('No images available');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCaption(''); // Clear caption before generating
    setGeneratedCaption(''); // Clear generated caption

    try {
      const formData = new FormData();

      // Fetch images from URLs and convert to blobs
      // Use original images for AI analysis, fallback to current images if no originals
      const analysisUrls = workflow.originalImageUrls && workflow.originalImageUrls.length > 0
        ? workflow.originalImageUrls
        : workflow.imageUrls;

      for (let i = 0; i < analysisUrls.length; i++) {
        const response = await fetch(analysisUrls[i]);
        const blob = await response.blob();
        const file = new File([blob], `image-${i}.jpg`, { type: 'image/jpeg' });
        formData.append(`image${i}`, file);
      }

      // Add listing information to the form
      formData.append('listingInfo', JSON.stringify({
        address: workflow.address,
        propertyType: workflow.propertyType,
        bedrooms: workflow.bedrooms,
        bathrooms: workflow.bathrooms,
        propertySize: workflow.propertySize,
        parking: workflow.parking,
        view: workflow.view,
        zipCode: workflow.zipCode,
        highlights: workflow.highlights,
        agencyName: workflow.agencyName,
        brokerageName: workflow.brokerageName,
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/api/autopost/analyseImage`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate caption');
      }

      const data = await response.json();
      setGeneratedCaption(data.description);
      setCaption(data.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate caption');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = async () => {
    if (!caption || caption.trim().length === 0) {
      setError('Caption is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      updateWorkflowSession({
        caption,
        generatedCaption,
      });

      router.push('/autopost/dashboard/publish?connected=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save caption');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpload = async () => {
    if (confirm('Are you sure you want to cancel this upload? All progress will be lost and uploaded images will be deleted.')) {
      try {
        await cancelUploadWorkflow();
        router.push('/autopost/dashboard');
      } catch (error) {
        console.error('Error canceling upload:', error);
        router.push('/autopost/dashboard');
      }
    }
  };

  if (!workflow) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <FiLoader className="text-4xl animate-spin text-neutral-300 dark:text-zinc-50" />
      </main>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-20 mt-[60px]">
        <StepIndicator currentStep="caption" />
        <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-neutral-300 dark:text-zinc-50 mb-3 tracking-tight">Add Caption</h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Write your own caption or use AI to generate one automatically.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-500/20 dark:bg-red-900/30 border border-red-500/40 dark:border-red-700/40 rounded-xl text-red-300 dark:text-red-200 text-sm font-medium text-center backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="grid gap-6">
            {/* AI Caption Section */}
            <Card className="p-6 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 overflow-hidden relative group hover:border-white/30 dark:hover:border-white/15 transition-all duration-300 shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <FiCpu className="text-9xl text-[var(--color-gold)] rotate-12 transform" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[var(--color-gold)]/20">
                    <FiZap className="text-3xl text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-white">Generate with AI</h2>
                    <p className="text-xs text-neutral-400 font-medium">Powered by advanced image analysis</p>
                  </div>
                </div>

                <p className="text-sm text-neutral-300 mb-6 max-w-lg leading-relaxed">
                  Let our AI analyze your images and listing details to create a compelling, professional description in seconds.
                </p>

                <Button
                  onClick={generateCaption}
                  disabled={isGenerating}
                  variant="primary"
                  className="w-full sm:w-auto bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-black dark:text-black border-transparent shadow-lg shadow-[var(--color-gold)]/30"
                  isLoading={isGenerating}
                  leftIcon={!isGenerating && <FiCpu />}
                >
                  {isGenerating ? 'Analyzing Images...' : 'Generate Caption'}
                </Button>
              </div>
            </Card>

            {/* Caption Input Section */}
            <Card className="p-6 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-[var(--color-gold)]/20 text-[var(--color-gold)] flex items-center justify-center">
                  <FiEdit2 />
                </div>
                <h2 className="font-semibold text-white">Your Caption</h2>
              </div>

              <div className="relative">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write your caption or paste the AI-generated one..."
                  rows={8}
                  className="w-full p-4 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent resize-none text-neutral-300 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-all"
                />
                <div className="absolute bottom-4 right-4 text-xs text-zinc-400 dark:text-zinc-600 font-medium bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
                  {caption.length} chars
                </div>
              </div>

              {caption.length > 2200 && (
                <p className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                  <FiInfo /> Consider shortening for better engagement
                </p>
              )}
            </Card>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex gap-4 justify-between">
            <Button
              onClick={() => router.push('/autopost/dashboard/template')}
              disabled={loading}
              variant="ghost"
              leftIcon={<FiChevronLeft />}
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={loading || !caption.trim()}
              variant="primary"
              size="lg"
              isLoading={loading}
              className="min-w-[150px]"
            >
              Continue
            </Button>
          </div>
        </motion.div>
        </main>
      </div>
    </>
  );
}
