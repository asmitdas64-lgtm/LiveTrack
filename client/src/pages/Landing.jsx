import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, User, ShieldCheck, Lock } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();
    const [showPin, setShowPin] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const MASTER_PIN = '1234'; // Hardcoded for the demo

    const handlePinInput = (num) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            setError(false);
            
            if (newPin.length === 4) {
                if (newPin === MASTER_PIN) {
                    navigate('/staff');
                } else {
                    setError(true);
                    setTimeout(() => {
                        setPin('');
                        setError(false);
                    }, 500);
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError(false);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            
            {/* Logo */}
            <div className="flex items-center gap-3 mb-16 animate-fade-in">
                <Activity className="text-green-500 w-8 h-8" />
                <span className="text-3xl font-semibold tracking-wide">LiveTrack</span>
            </div>

            {!showPin ? (
                /* Role Selection */
                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
                    <button 
                        onClick={() => navigate('/intake')}
                        className="flex-1 bg-neutral-950 border border-neutral-900 hover:border-green-500/50 hover:bg-neutral-900 transition-all p-8 flex flex-col items-center text-center group"
                    >
                        <div className="w-16 h-16 rounded-full bg-neutral-900 group-hover:bg-green-500/10 flex items-center justify-center mb-6 transition-colors">
                            <User className="w-8 h-8 text-neutral-400 group-hover:text-green-400 transition-colors" />
                        </div>
                        <h2 className="text-xl font-medium mb-2">I am a Patient</h2>
                        <p className="text-neutral-500 text-sm">Register for admission and track your waiting status.</p>
                    </button>

                    <button 
                        onClick={() => setShowPin(true)}
                        className="flex-1 bg-neutral-950 border border-neutral-900 hover:border-green-500/50 hover:bg-neutral-900 transition-all p-8 flex flex-col items-center text-center group"
                    >
                        <div className="w-16 h-16 rounded-full bg-neutral-900 group-hover:bg-green-500/10 flex items-center justify-center mb-6 transition-colors">
                            <ShieldCheck className="w-8 h-8 text-neutral-400 group-hover:text-green-400 transition-colors" />
                        </div>
                        <h2 className="text-xl font-medium mb-2">I am Staff</h2>
                        <p className="text-neutral-500 text-sm">Access the secure ER dashboard and patient management.</p>
                    </button>
                </div>
            ) : (
                /* PIN Entry Screen - Desktop Friendly */
                <div className="w-full max-w-md animate-fade-in">
                    <div className="bg-neutral-950 border border-neutral-900 p-10 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                            <Lock className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Staff Access</h2>
                        <p className="text-neutral-500 text-sm mb-10 text-center">Enter your 4-digit security PIN to access the dashboard.</p>
                        
                        {/* Hidden input to capture physical keyboard typing */}
                        <input
                            type="password"
                            autoFocus
                            maxLength={4}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-default"
                            value={pin}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 4) {
                                    setPin(val);
                                    setError(false);
                                    if (val.length === 4) {
                                        if (val === MASTER_PIN) {
                                            sessionStorage.setItem('staff-auth', 'true');
                                            navigate('/staff');
                                        } else {
                                            setError(true);
                                            setTimeout(() => {
                                                setPin('');
                                                setError(false);
                                            }, 500);
                                        }
                                    }
                                }
                            }}
                        />

                        {/* OTP Style Boxes */}
                        <div className={`flex gap-4 mb-8 ${error ? 'animate-shake' : ''}`}>
                            {[0, 1, 2, 3].map((index) => (
                                <div 
                                    key={index} 
                                    className={`w-16 h-20 text-3xl flex items-center justify-center bg-neutral-900 border transition-all duration-200 ${
                                        error ? 'border-red-500 text-red-500' : 
                                        index === pin.length ? 'border-green-500 bg-neutral-800' : // Active box
                                        index < pin.length ? 'border-green-500/50 text-white' : // Filled box
                                        'border-neutral-800' // Empty box
                                    }`}
                                >
                                    {index < pin.length ? '•' : ''}
                                </div>
                            ))}
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mb-4">Invalid PIN. Please try again.</p>
                        )}

                        <button
                            onClick={() => {
                                setShowPin(false);
                                setPin('');
                                setError(false);
                            }}
                            className="text-neutral-500 hover:text-white text-sm tracking-wider uppercase font-medium transition-colors"
                        >
                            Return to Role Selection
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
