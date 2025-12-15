"use client"

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Project {
    id: string;
    statusType: 'live' | 'upcoming' | 'completed' | 'idea';
    logo: string;
    name: string;
    website: string;
    description: string;
    progress: number;
    raised: number;
    currency: string;
    goal: number;
    endTime?: Date;
    startTime?: Date;
}

function CountdownTimer({ targetDate, isStart = false }: { targetDate: Date; isStart?: boolean }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="text-sm">
            <span className="font-bold uppercase tracking-wider">{isStart ? "STARTS IN:" : "ENDS IN:"}</span>
            <div className="font-mono mt-2 text-xl font-black">
                {timeLeft.days}D {timeLeft.hours}H {timeLeft.minutes}M {timeLeft.seconds}S
            </div>
        </div>
    );
}

export function ProjectCard({ project }: { project: Project }) {
    const getStatusColor = () => {
        switch (project.statusType) {
            case 'live': return 'bg-[#7DF9FF]';
            case 'upcoming': return 'bg-[#FFFF00]';
            case 'completed': return 'bg-[#2FFF2F]';
            default: return 'bg-[#FFF9F0]';
        }
    };

    return (
        <div className="border-4 border-black p-6 bg-[#FFF9F0] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 group cursor-pointer">
            {/* Status indicator */}
            <div className={`absolute top-0 right-0 w-4 h-4 border-2 border-black ${getStatusColor()}`}></div>

            <div className="flex items-center space-x-4 mb-6">
                <div className="border-2 border-black rounded-full p-1 bg-white">
                    <Avatar className="w-14 h-14 border-2 border-black rounded-full">
                        <AvatarImage src={project.logo} alt={`${project.name} logo`} />
                        <AvatarFallback className="text-lg font-black uppercase">
                            {project.name.slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="min-w-0">
                    <h3 className="text-2xl font-black uppercase tracking-tight leading-tight break-words">
                        {project.name}
                    </h3>
                    <p className="text-sm font-bold mt-1 truncate">{project.website}</p>
                </div>
            </div>

            <p className="font-medium mb-6 min-h-[3rem]">{project.description}</p>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black uppercase tracking-wider">PROGRESS</span>
                    <span className="text-sm font-black">{project.progress}%</span>
                </div>
                <div className="w-full bg-white border-2 border-black h-4">
                    <div
                        className="bg-black h-full transition-all"
                        style={{ width: `${project.progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold">{project.raised.toLocaleString()} {project.currency}</span>
                    <span className="text-xs font-bold">{project.goal.toLocaleString()} {project.currency}</span>
                </div>
            </div>

            {project.statusType === 'live' && project.endTime && (
                <div className="pt-6 border-t-2 border-black">
                    <CountdownTimer targetDate={project.endTime} />
                    <button className="w-full mt-4 bg-[#7DF9FF] text-black h-12 font-black uppercase text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                        PARTICIPATE
                    </button>
                </div>
            )}

            {project.statusType === 'upcoming' && project.startTime && (
                <div className="pt-6 border-t-2 border-black">
                    <CountdownTimer targetDate={project.startTime} isStart={true} />
                    <button className="w-full mt-4 bg-[#FFFF00] text-black h-12 font-black uppercase text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                        NOTIFY ME
                    </button>
                </div>
            )}

            {project.statusType === 'completed' && (
                <div className="pt-6 border-t-2 border-black text-center">
                    <p className="font-black uppercase text-sm tracking-wider mb-2">PROJECT COMPLETED</p>
                    <button className="text-sm font-black uppercase underline hover:no-underline">VIEW RESULTS →</button>
                </div>
            )}
        </div>
    );
}
