"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Lightbulb, Settings, Zap } from "lucide-react";
import { useState } from "react";

const projectStatuses = [
  { id: "idea", label: "Idea with Whitepaper", icon: Lightbulb },
  { id: "whitepaper", label: "Idea with Whitepaper", icon: FileText },
  { id: "development", label: "In Early Development", icon: Settings },
  { id: "launch", label: "Ready to Launch", icon: Zap }
];

export default function CreateProjectPage() {
  const [formData, setFormData] = useState({
    projectName: "",
    email: "",
    website: "",
    targetRaise: "",
    projectBrief: "",
    projectStatus: "",
    telegramLink: "",
    twitterLink: "",
    hasRaisedFunds: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusSelect = (statusId: string) => {
    setFormData(prev => ({
      ...prev,
      projectStatus: statusId
    }));
  };

  const handleFundsSelect = (answer: string) => {
    setFormData(prev => ({
      ...prev,
      hasRaisedFunds: answer
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-20 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <button className="flex items-center gap-3 text-black hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold uppercase text-sm tracking-wider">BACK</span>
          </button>
          <button className="border-2 border-black px-6 py-3 font-bold uppercase text-sm hover:bg-black hover:text-white transition-all">
            CLEAR ALL & RESTART
          </button>
        </div>

        <h1 className="text-6xl md:text-7xl font-black uppercase mb-16 tracking-tight">
          CREATE<br />PROJECT
        </h1>

        <div className="space-y-10">
          {/* Project Name */}
          <div>
            <Label className="text-sm font-bold uppercase tracking-wider mb-4 block">
              PROJECT NAME
            </Label>
            <Input
              value={formData.projectName}
              onChange={(e) => handleInputChange("projectName", e.target.value)}
              placeholder="ENTER PROJECT NAME"
              className="h-16 text-lg border-2 border-black focus:ring-0 focus:border-black font-medium placeholder:text-gray-400 uppercase"
            />
          </div>

          {/* Email and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-4 block">
                EMAIL ADDRESS
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="YOUR@EMAIL.COM"
                className="h-16 border-2 border-black focus:ring-0 focus:border-black placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-4 block">
                WEBSITE OR WHITEPAPER
              </Label>
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="HTTPS://..."
                className="h-16 border-2 border-black focus:ring-0 focus:border-black placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Target Raise */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-sm font-bold uppercase tracking-wider">
                TARGET RAISE
              </Label>
              <span className="text-sm font-medium">1 WMTX = $2.35</span>
            </div>
            <div className="relative">
              <Input
                type="number"
                value={formData.targetRaise}
                onChange={(e) => handleInputChange("targetRaise", e.target.value)}
                placeholder="0.00"
                className="h-20 text-3xl border-2 border-black pr-24 placeholder:text-gray-400 focus:ring-0 focus:border-black font-black"
              />
              <span className="absolute right-6 top-1/2 transform -translate-y-1/2 font-bold text-lg">
                WMTX
              </span>
            </div>
            <p className="text-sm mt-2 font-medium">~ $0.00</p>
          </div>

          {/* Project Brief */}
          <div>
            <Label className="text-sm font-bold uppercase tracking-wider mb-4 block">
              PROJECT BRIEF
            </Label>
            <Textarea
              value={formData.projectBrief}
              onChange={(e) => handleInputChange("projectBrief", e.target.value)}
              placeholder="DESCRIBE YOUR PROJECT..."
              className="min-h-40 border-2 border-black resize-none placeholder:text-gray-400 focus:ring-0 focus:border-black"
            />
          </div>

          {/* Project Status */}
          <div>
            <Label className="text-sm font-bold uppercase tracking-wider mb-6 block">
              PROJECT STATUS
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {projectStatuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => handleStatusSelect(status.id)}
                  className={`p-6 border-2 border-black transition-all text-left hover:bg-black hover:text-white group ${formData.projectStatus === status.id
                    ? "bg-black text-white"
                    : "bg-white text-black"
                    }`}
                >
                  <status.icon
                    className={`w-7 h-7 mb-3 ${formData.projectStatus === status.id ? "text-white" : "text-black group-hover:text-white"
                      }`}
                  />
                  <p className="text-sm font-bold uppercase">
                    {status.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="border-t-2 border-black pt-12 mt-12">
            <h3 className="text-2xl font-black uppercase mb-10 tracking-tight">
              ADDITIONAL INFO
            </h3>

            {/* Social Media Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-4 block">
                  TELEGRAM LINK
                </Label>
                <Input
                  value={formData.telegramLink}
                  onChange={(e) => handleInputChange("telegramLink", e.target.value)}
                  placeholder="TELEGRAM.ME/..."
                  className="h-16 border-2 border-black placeholder:text-gray-400 focus:ring-0 focus:border-black"
                />
              </div>
              <div>
                <Label className="text-sm font-bold uppercase tracking-wider mb-4 block">
                  X (TWITTER) USERNAME
                </Label>
                <Input
                  value={formData.twitterLink}
                  onChange={(e) => handleInputChange("twitterLink", e.target.value)}
                  placeholder="@USERNAME"
                  className="h-16 border-2 border-black placeholder:text-gray-400 focus:ring-0 focus:border-black"
                />
              </div>
            </div>

            {/* Have You Already Raised Funds */}
            <div>
              <Label className="text-sm font-bold uppercase tracking-wider mb-6 block">
                HAVE YOU ALREADY RAISED FUNDS?
              </Label>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <button
                  onClick={() => handleFundsSelect("no")}
                  className={`p-6 border-2 border-black transition-all ${formData.hasRaisedFunds === "no"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-black hover:text-white"
                    }`}
                >
                  <span className="font-black text-lg uppercase">NO</span>
                </button>
                <button
                  onClick={() => handleFundsSelect("yes")}
                  className={`p-6 border-2 border-black transition-all ${formData.hasRaisedFunds === "yes"
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-black hover:text-white"
                    }`}
                >
                  <span className="font-black text-lg uppercase">YES</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-12">
            <button
              className="w-full h-16 bg-gray-300 text-gray-600 font-bold uppercase tracking-wider border-2 border-gray-300 cursor-not-allowed"
              disabled
            >
              SUBMIT PROJECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}