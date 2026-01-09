import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

interface FormData {
    rating: number;
    content: string;
}

export default function ReviewForm() {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [response, setResponse] = useState<any>(null);

    const rating = watch('rating');

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const res = await api.post('/reviews/', data);
            setResponse(res.data);
        } catch (e) {
            console.error(e);
            alert('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                {!response ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-panel p-8"
                    >
                        <h2 className="text-3xl font-bold mb-2">We value your feedback</h2>
                        <p className="text-slate-400 mb-8">Tell us about your experience.</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setValue('rating', star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={32}
                                                className={cn(
                                                    "transition-colors",
                                                    star <= (rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && <span className="text-red-400 text-sm">Please select a rating</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Review</label>
                                <textarea
                                    {...register('content', { required: true })}
                                    className="glass-input w-full h-32 resize-none"
                                    placeholder="Share your thoughts..."
                                />
                                {errors.content && <span className="text-red-400 text-sm">This field is required</span>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !rating}
                                className="glass-button w-full flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-8 text-center"
                    >
                        <div className="flex justify-center mb-4">
                            <CheckCircle size={64} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                        <p className="text-slate-300 mb-6">{response.response}</p>

                        <div className="bg-white/5 p-4 rounded-lg text-left text-sm text-slate-500 italic">
                            Your review helps us improve.
                        </div>

                        <button
                            onClick={() => {
                                setResponse(null);
                                setValue('rating', 0);
                                setValue('content', '');
                            }}
                            className="mt-8 text-blue-400 hover:text-blue-300"
                        >
                            Submit another review
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
