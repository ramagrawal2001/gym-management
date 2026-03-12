import { useState, useRef, useEffect } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import Button from './Button';

const ImageUpload = ({ label, value, onChange, error, className = '', enableCamera = false }) => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [capturing, setCapturing] = useState(false);

    useEffect(() => {
        // Handle value prop - can be a URL string or File object
        if (value) {
            if (typeof value === 'string') {
                // It's a URL
                setPreview(value);
            } else if (value instanceof File) {
                // It's a File object, create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(value);
            }
        } else {
            setPreview(null);
        }
    }, [value]);

    useEffect(() => {
        return () => {
            // Cleanup camera stream on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                if (onChange) {
                    onChange(file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
        if (onChange) {
            onChange(null);
        }
        stopCamera();
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setShowCamera(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
        setCapturing(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        
        setCapturing(true);
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                    if (onChange) {
                        onChange(file);
                    }
                };
                reader.readAsDataURL(file);
                stopCamera();
            }
            setCapturing(false);
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <div className="space-y-2">
                {showCamera ? (
                    <div className="space-y-2">
                        <div className="relative w-full max-w-md mx-auto">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full rounded-lg border border-gray-200 dark:border-slate-700"
                            />
                            <button
                                type="button"
                                onClick={stopCamera}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex justify-center gap-2">
                            <Button
                                type="button"
                                onClick={capturePhoto}
                                disabled={capturing}
                                variant="primary"
                            >
                                {capturing ? 'Capturing...' : 'Capture Photo'}
                            </Button>
                            <Button
                                type="button"
                                onClick={stopCamera}
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : preview ? (
                    <div className="relative inline-block">
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>
                        {enableCamera && (
                            <Button
                                type="button"
                                onClick={startCamera}
                                variant="secondary"
                                className="w-full"
                            >
                                <Camera size={18} className="mr-2" />
                                Capture Photo
                            </Button>
                        )}
                    </div>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default ImageUpload;

