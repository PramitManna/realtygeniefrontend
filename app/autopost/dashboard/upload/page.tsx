'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiUpload, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';
import StepIndicator from '@/components/StepIndicator';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button2';
import { UserNavbar } from '@/components/UserNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { PageSelector } from '@/components/PageSelector';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { cancelUploadWorkflow } from '@/lib/autopost/cancel-workflow';
import {
  generateSessionId,
  createEmptyWorkflow,
  saveWorkflowSession,
  getWorkflowSession,
  updateWorkflowSession,
} from '@/lib/autopost/workflow-session';

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const connected = searchParams.get('connected');
  const { isAuthenticated, hasMetaTokens, isLoading: authLoading, userId } = useAuth();

  // Debug: Log every render
  console.log('🎨 UPLOAD PAGE RENDER:', {
    authLoading,
    isAuthenticated, 
    hasMetaTokens,
    connected,
    timestamp: new Date().toISOString()
  });

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  // Initialize workflow on mount
  useEffect(() => {
    let workflow = getWorkflowSession();
    if (!workflow) {
      const sessionId = generateSessionId();
      workflow = createEmptyWorkflow(sessionId);
      saveWorkflowSession(workflow);
    }
  }, []);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="text-4xl animate-spin text-gold mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/auth/login?redirect=/autopost/dashboard/upload');
    return null;
  }

  // Check if user has Meta tokens OR is coming from OAuth
  if (!hasMetaTokens && connected !== 'true') {
    console.log('Redirecting to dashboard - No Meta tokens');
    router.push('/autopost/dashboard');
    return null;
  }

  console.log('✅ Rendering upload page with hasMetaTokens:', hasMetaTokens);

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setError('Please upload image files only');
      return;
    }

    if (fileArray.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    setUploadedImages(fileArray);
    setImagePreviews(fileArray.map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setError('Please upload image files only');
      return;
    }

    if (fileArray.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    setUploadedImages(fileArray);
    setImagePreviews(fileArray.map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const processAndUploadImages = async () => {
    if (uploadedImages.length === 0) {
      setError('Please select images first');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress('Starting upload...');

    try {
      const urls: string[] = [];
      const publicIds: string[] = [];

      for (let i = 0; i < uploadedImages.length; i++) {
        setProgress(`Uploading image ${i + 1}/${uploadedImages.length}...`);

        const formData = new FormData();
        formData.append('file', uploadedImages[i]);

        const response = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/api/autopost/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Upload failed: ${errorData.error}`);
        }

        const data = await response.json();
        urls.push(data.url);
        publicIds.push(data.filename);
      }


      const workflow = updateWorkflowSession({
        imageUrls: urls,
        imagePublicIds: publicIds,
        originalImageUrls: urls, // Store as original images for AI analysis
        originalImagePublicIds: publicIds,
        previewUrls: urls, // Initialize with original URLs
        caption: '', // Clear old caption
        generatedCaption: '', // Clear old generated caption
        selectedTemplateId: 'none', // Reset template selection
        templateCustomValues: {}, // Reset template custom values
      });

      if (!workflow) {
        throw new Error('Session error');
      }

      setProgress('');
      router.push('/autopost/dashboard/listing?connected=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (uploadedImages.length === 0) {
      setError('Please select images first');
      return;
    }
    await processAndUploadImages();
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

  return (
    <>
      <div className="min-h-screen text-neutral-300 pb-20 mt-[60px]">
        <StepIndicator currentStep="upload" />
        <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Selector */}
          {userId && (
            <div className="mb-6">
              <ConnectionStatus userId={userId} />
              <PageSelector userId={userId} />
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-neutral-300 mb-3 tracking-tight">Upload Images</h1>
            <p className="text-zinc-400 max-w-md mx-auto">
              Select up to 10 images to get started. We&apos;ll help you create stunning posts in seconds.
            </p>
          </div>

          <Card className="p-8 border-dashed border-2 border-zinc-700 hover:border-gold transition-colors cursor-pointer bg-zinc-900/30 backdrop-blur-xl" 
            style={{
              background: 'rgba(24, 24, 27, 0.3)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            }}
            onClick={handleBrowseClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-20 w-20 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20 mb-2">
                <FiUpload className="text-3xl" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-neutral-300">Upload or capture photos</p>
                <p className="text-sm text-zinc-400 mt-2">tap to select from device or take photos directly</p>
                <p className="text-xs text-gold/70 mt-4 font-medium uppercase tracking-wider">JPG, PNG • Max 10 images</p>
              </div>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </Card>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-red-500/10 dark:bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium text-center backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}

          {uploadedImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-300">
                  Selected Images ({uploadedImages.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
                    setUploadedImages([]);
                    setImagePreviews([]);
                    setError(null);
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {uploadedImages.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative rounded-xl overflow-hidden bg-zinc-900 aspect-square group shadow-lg border border-gold/10 hover:border-gold/30 transition-all"
                  >
                    {imagePreviews[index] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreviews[index]}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 text-center border border-gold/20">
                      <p className="text-neutral-300 text-xs font-medium truncate w-full px-2">{file.name}</p>
                      <p className="text-gold/80 text-[10px] mt-1">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {progress && (
                <div className="mb-8 p-4 bg-zinc-900/30 rounded-xl flex items-center gap-3 justify-center border border-gold/20 backdrop-blur-sm" style={{
                  background: 'rgba(24, 24, 27, 0.3)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}>
                  <FiLoader className="animate-spin text-gold" />
                  <span className="text-sm font-medium text-zinc-300">{progress}</span>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleContinue}
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px] bg-gold hover:bg-gold-soft text-black font-semibold shadow-[0_6px_28px_rgba(212,175,55,0.18)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.25)]"
                  isLoading={loading}
                  rightIcon={!loading && <FiUpload />}
                >
                  {loading ? 'Processing...' : `Continue (${uploadedImages.length})`}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
        </main>
      </div>
    </>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadPageContent />
    </Suspense>
  );
}
