import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  Send,
  X,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldAlert,
  Sparkles,
  DollarSign,
  Clock,
  MapPin,
  ArrowRight,
  Headphones,
  RotateCcw,
  Navigation,
  Compass,
  AlertOctagon,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  User,
  Booking,
  UserRole,
  EmergencyEscalationTicket,
  AutomatedDisputeResolution,
} from '../../types';
import { playAlertChime } from '../../utils/sound';

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  actionTaken?: {
    type: 'wallet_credit' | 'full_refund' | 'admin_escalation' | 'landmark_sent';
    amount?: number;
    referenceId?: string;
    details?: string;
  };
  isEmergencyAlert?: boolean;
  emergencyTicketId?: string;
}

interface AIChatSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  activeRole: UserRole;
  activeBooking?: Booking | null;
  onCreditUserWallet?: (amount: number, reason: string) => void;
  onInitiateRefund?: (amount: number, reason: string) => void;
  onRecordDispute?: (dispute: AutomatedDisputeResolution) => void;
  onTriggerEmergencyEscalation?: (ticket: EmergencyEscalationTicket) => void;
}

export const AIChatSupportModal: React.FC<AIChatSupportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeRole: initialActiveRole,
  activeBooking,
  onCreditUserWallet,
  onInitiateRefund,
  onRecordDispute,
  onTriggerEmergencyEscalation,
}) => {
  // Allow toggling between customer and chef support modes
  const [selectedRole, setSelectedRole] = useState<'customer' | 'chef'>(
    initialActiveRole === 'chef' ? 'chef' : 'customer'
  );

  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting on role switch or open
  useEffect(() => {
    if (isOpen) {
      const greetingText =
        selectedRole === 'chef'
          ? `Namaste Chef ${
              currentUser?.name?.split(' ')[0] || 'Partner'
            }! 👨‍🍳 I am your 24/7 ChefPulse AI Dispatch & Operations Assistant. Need immediate help with navigation coordinates, an uncooperative host, or instant wallet payout status?`
          : `Hello ${
              currentUser?.name?.split(' ')[0] || 'there'
            }! 🍽️ I am your 24/7 ChefPulse AI Resolution Assistant. I can automatically check chef GPS transit, issue SLA delay credits, process instant no-show escrow refunds, or handle dietary concerns.`;

      setMessages([
        {
          id: `msg-init-${selectedRole}`,
          sender: 'bot',
          text: greetingText,
          timestamp: 'Just now',
        },
      ]);
    }
  }, [isOpen, selectedRole, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  if (!isOpen) return null;

  const safetyKeywords = [
    'harassment',
    'harass',
    'accident',
    'fire',
    'threat',
    'injury',
    'assault',
    'police',
    'stolen',
    'danger',
    'physical',
    'emergency',
    'abuse',
    'unsafe',
    'attack',
    'violence',
    'gas leak',
    'burn',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: SupportChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsBotTyping(true);

    const lowerText = text.toLowerCase();
    const matchedSafetyWords = safetyKeywords.filter((kw) => lowerText.includes(kw));
    const hasEmergency = matchedSafetyWords.length > 0;

    setTimeout(() => {
      setIsBotTyping(false);

      // EMERGENCY SAFETY ESCALATION FLOW
      if (hasEmergency) {
        const ticketId = `EMERG-AI-${Math.floor(1000 + Math.random() * 9000)}`;
        const nowTime = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        playAlertChime('sos_panic');

        const emergencyTicket: EmergencyEscalationTicket = {
          id: ticketId,
          reason: `Flagged Safety Keywords [${matchedSafetyWords.join(', ')}]: "${text}"`,
          userType: selectedRole,
          userName: currentUser?.name || (selectedRole === 'chef' ? 'Chef Partner' : 'Customer'),
          userPhone: currentUser?.phone || '+91 98450 91234',
          details: `Safety keyword auto-intercept by 24/7 AI Bot. Active query: "${text}". Booking: ${
            activeBooking ? `#${activeBooking.id} (${activeBooking.chefName})` : 'General inquiry'
          }`,
          timestamp: nowTime,
          status: 'DISPATCHED',
          severity: 'CRITICAL_LEVEL_1',
          location: currentUser?.address || activeBooking?.serviceAddress || 'Bangalore Metro Hub',
          flaggedKeywords: matchedSafetyWords,
          actionTaken:
            'Critical incident dispatched to Admin Command Desk. Live GPS telemetry locked. Field Safety Desk alerted.',
          bookingId: activeBooking?.id,
        };

        const emergencyBotMsg: SupportChatMessage = {
          id: `msg-resp-${Date.now()}`,
          sender: 'bot',
          text: `🚨 URGENT SAFETY ESCALATION ACTIVATED! I have detected safety-critical keywords (${matchedSafetyWords
            .map((w) => `"${w}"`)
            .join(
              ', '
            )}). A Level-1 Critical Incident ticket (${ticketId}) has been dispatched immediately to the human Admin Operations Desk. Your GPS coordinates have been locked. If you are in immediate physical danger, tap below to contact the 24/7 Emergency Safety Desk or Police.`,
          timestamp: 'Just now',
          isEmergencyAlert: true,
          emergencyTicketId: ticketId,
          actionTaken: {
            type: 'admin_escalation',
            referenceId: ticketId,
            details: `Flagged: ${matchedSafetyWords.join(', ')}`,
          },
        };

        setMessages((prev) => [...prev, emergencyBotMsg]);

        if (onTriggerEmergencyEscalation) {
          onTriggerEmergencyEscalation(emergencyTicket);
        }

        if (onRecordDispute) {
          onRecordDispute({
            id: `DISP-${ticketId}`,
            type: 'emergency_escalation',
            userRole: selectedRole,
            userName: currentUser?.name || 'User',
            bookingId: activeBooking?.id,
            reason: `Safety escalation [${matchedSafetyWords.join(', ')}]`,
            timestamp: 'Just now',
            status: 'ESCALATED',
          });
        }
        return;
      }

      // CUSTOMER DISPUTE SCENARIOS
      if (selectedRole === 'customer') {
        // Dispute 1: Late Arrival / Transit Delay
        if (
          lowerText.includes('late') ||
          lowerText.includes('delay') ||
          lowerText.includes('arrived late') ||
          lowerText.includes('waiting') ||
          lowerText.includes('where is the chef')
        ) {
          const creditAmount = 150;
          playAlertChime('accepted');

          const creditMsg: SupportChatMessage = {
            id: `msg-resp-${Date.now()}`,
            sender: 'bot',
            text: `⏱️ 20-Minute SLA Transit Check: I queried the chef's live transit telemetry. Due to localized peak road congestion, arrival is delayed by approximately 6 minutes. As per ChefPulse's On-Time Guarantee, I have automatically credited ₹${creditAmount} directly to your ChefPulse Wallet! The chef is currently on 100ft Road and navigating to your gate.`,
            timestamp: 'Just now',
            actionTaken: {
              type: 'wallet_credit',
              amount: creditAmount,
              referenceId: `CR-LATE-${Date.now().toString().slice(-4)}`,
              details: '₹150 SLA Delay Guarantee Credit',
            },
          };

          setMessages((prev) => [...prev, creditMsg]);

          if (onCreditUserWallet) {
            onCreditUserWallet(creditAmount, 'SLA Delay Guarantee Credit (₹150)');
          }

          if (onRecordDispute) {
            onRecordDispute({
              id: `DISP-LATE-${Date.now().toString().slice(-4)}`,
              type: 'delay_credit',
              userRole: 'customer',
              userName: currentUser?.name || 'Customer',
              bookingId: activeBooking?.id,
              amount: creditAmount,
              reason: 'Automatic ₹150 SLA Late Arrival Credit',
              timestamp: 'Just now',
              status: 'CREDITED',
            });
          }
          return;
        }

        // Dispute 2: Chef No-Show / Cancellation
        if (
          lowerText.includes('not show up') ||
          lowerText.includes('no show') ||
          lowerText.includes('no-show') ||
          lowerText.includes('never arrived') ||
          lowerText.includes('cancelled') ||
          lowerText.includes('unreachable')
        ) {
          const refundAmount = activeBooking ? activeBooking.totalAmount : 899;
          playAlertChime('accepted');

          const refundMsg: SupportChatMessage = {
            id: `msg-resp-${Date.now()}`,
            sender: 'bot',
            text: `❌ Automated Geofence Audit: Verified that the assigned chef failed to trigger arrival OTP within the geofence perimeter. I have cancelled the active booking and initiated an immediate 100% digital escrow refund of ₹${refundAmount} back to your original payment method (UPI / Card). Additionally, I have credited ₹200 bonus dining credit to your wallet for the inconvenience.`,
            timestamp: 'Just now',
            actionTaken: {
              type: 'full_refund',
              amount: refundAmount,
              referenceId: `REF-NOSHOW-${Date.now().toString().slice(-4)}`,
              details: `100% Escrow Refund of ₹${refundAmount} + ₹200 Goodwill Credit`,
            },
          };

          setMessages((prev) => [...prev, refundMsg]);

          if (onInitiateRefund) {
            onInitiateRefund(refundAmount, 'Chef No-Show 100% Escrow Refund');
          } else if (onCreditUserWallet) {
            onCreditUserWallet(200, 'Chef No-Show Goodwill Credit');
          }

          if (onRecordDispute) {
            onRecordDispute({
              id: `DISP-NOSHOW-${Date.now().toString().slice(-4)}`,
              type: 'no_show_refund',
              userRole: 'customer',
              userName: currentUser?.name || 'Customer',
              bookingId: activeBooking?.id,
              amount: refundAmount,
              reason: '100% Escrow Refund for Chef No-Show',
              timestamp: 'Just now',
              status: 'PROCESSED',
            });
          }
          return;
        }

        // Dispute 3: Wrong Ingredients / Taste / Quality
        if (
          lowerText.includes('wrong') ||
          lowerText.includes('ingredient') ||
          lowerText.includes('taste') ||
          lowerText.includes('spicy') ||
          lowerText.includes('bad') ||
          lowerText.includes('hygiene')
        ) {
          const compAmount = 250;
          playAlertChime('accepted');

          const compMsg: SupportChatMessage = {
            id: `msg-resp-${Date.now()}`,
            sender: 'bot',
            text: `🍳 Quality Guarantee Resolution: I have logged your culinary feedback in the chef's audit profile. As part of our Dish Satisfaction Guarantee, I have credited ₹${compAmount} to your wallet. You can also submit detailed blind tags (e.g., "Spice Level", "Cleanliness") in the post-gig rating sheet.`,
            timestamp: 'Just now',
            actionTaken: {
              type: 'wallet_credit',
              amount: compAmount,
              referenceId: `CR-QUAL-${Date.now().toString().slice(-4)}`,
              details: '₹250 Culinary Quality Courtesy Credit',
            },
          };

          setMessages((prev) => [...prev, compMsg]);

          if (onCreditUserWallet) {
            onCreditUserWallet(compAmount, 'Recipe Discrepancy Courtesy');
          }

          if (onRecordDispute) {
            onRecordDispute({
              id: `DISP-QUAL-${Date.now().toString().slice(-4)}`,
              type: 'quality_voucher',
              userRole: 'customer',
              userName: currentUser?.name || 'Customer',
              bookingId: activeBooking?.id,
              amount: compAmount,
              reason: '₹250 Dish Quality Goodwill Credit',
              timestamp: 'Just now',
              status: 'CREDITED',
            });
          }
          return;
        }
      }

      // CHEF SUPPORT SCENARIOS
      if (selectedRole === 'chef') {
        // Chef Issue 1: Navigation / Address Failure
        if (
          lowerText.includes('navigation') ||
          lowerText.includes('address') ||
          lowerText.includes('lost') ||
          lowerText.includes('locate') ||
          lowerText.includes('cannot find') ||
          lowerText.includes('route') ||
          lowerText.includes('gate')
        ) {
          playAlertChime('ding');
          const addressTarget = activeBooking?.serviceAddress || 'Indiranagar 100ft Road, Bengaluru';

          const navMsg: SupportChatMessage = {
            id: `msg-resp-${Date.now()}`,
            sender: 'bot',
            text: `📍 High-Accuracy Landmark Navigation: I have extracted exact pinpoint coordinates for "${addressTarget}".
1. An automated SMS buzzer has been dispatched to the customer's phone requesting them to turn on exterior lighting or meet you at Gate 1.
2. Tap below to launch Google Maps Street View for the exact building frontage.`,
            timestamp: 'Just now',
            actionTaken: {
              type: 'landmark_sent',
              referenceId: `NAV-LOC-${Date.now().toString().slice(-4)}`,
              details: `Sent SMS alert to host + Verified GPS coordinates`,
            },
          };

          setMessages((prev) => [...prev, navMsg]);

          if (onRecordDispute) {
            onRecordDispute({
              id: `DISP-NAV-${Date.now().toString().slice(-4)}`,
              type: 'navigation_assistance',
              userRole: 'chef',
              userName: currentUser?.name || 'Chef',
              bookingId: activeBooking?.id,
              reason: `Nav assistance for ${addressTarget}`,
              timestamp: 'Just now',
              status: 'PROCESSED',
            });
          }
          return;
        }

        // Chef Issue 2: Host Uncooperative / Door Not Opening
        if (
          lowerText.includes('door') ||
          lowerText.includes('uncooperative') ||
          lowerText.includes('not opening') ||
          lowerText.includes('host') ||
          lowerText.includes('call not picking') ||
          lowerText.includes('absent')
        ) {
          playAlertChime('ding');
          const hostMsg: SupportChatMessage = {
            id: `msg-resp-${Date.now()}`,
            sender: 'bot',
            text: `🚪 Door-Knock Protocol Activated: We have triggered 3 high-priority push buzzers to the host's smartphone. If the customer does not open within 10 minutes from your arrival timestamp, our system will automatically resolve the gig as "Host No-Show" and credit 100% of your cooking payout (plus travel compensation) to your wallet. You are protected by our Partner Escrow Guarantee.`,
            timestamp: 'Just now',
          };

          setMessages((prev) => [...prev, hostMsg]);
          return;
        }

        // Chef Issue 3: Payout / Earnings / Instant Withdrawal
        if (
          lowerText.includes('payout') ||
          lowerText.includes('withdrawal') ||
          lowerText.includes('bank') ||
          lowerText.includes('money') ||
          lowerText.includes('earnings') ||
          lowerText.includes('razorpay') ||
          lowerText.includes('disburse')
        ) {
          const payoutMsg: SupportChatMessage = {
            id: `msg-resp-${Date.now()}`,
            sender: 'bot',
            text: `💰 Instant 24/7 IMPS Payout Engine: Your ChefPulse earnings are backed by our RazorpayX automated disbursement gateway. The moment you swipe "Job Completed", funds move from digital escrow directly into your available balance. You can withdraw 24 hours a day, 7 days a week directly to your UPI VPA or bank account with 0 mandatory weekly waiting periods!`,
            timestamp: 'Just now',
          };

          setMessages((prev) => [...prev, payoutMsg]);
          return;
        }
      }

      // Default Intelligent Response
      const defaultResp: SupportChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'bot',
        text: `Thank you for contacting ChefPulse 24/7 AI Support! I am monitoring your live account status. For instant resolution, choose one of the quick options below, or type your query (e.g., "chef delayed", "cannot find address", "emergency").`,
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, defaultResp]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[2400] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl flex flex-col h-[670px] max-h-[94vh] overflow-hidden text-neutral-100">
        
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Bot size={22} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">ChefPulse 24/7 AI Concierge</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  24/7 Live
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Instant Pan-India Resolution • Automated Dispute Credits & Safety Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Persona Toggle */}
            <div className="flex items-center bg-neutral-900 p-0.5 rounded-xl border border-neutral-800 text-[10px]">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedRole === 'customer'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🍽️ Customer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('chef')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedRole === 'chef'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                👨‍🍳 Chef
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white text-lg p-1.5 rounded-xl hover:bg-neutral-800 cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-neutral-950/40">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-xs'
                      : m.isEmergencyAlert
                      ? 'bg-red-950/90 border-2 border-red-500 text-red-100 font-medium rounded-tl-xs shadow-lg shadow-red-950'
                      : 'bg-neutral-800 text-neutral-200 border border-neutral-700/80 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Action badge if credit/refund was issued */}
                  {m.actionTaken && (
                    <div
                      className={`mt-2.5 pt-2 border-t ${
                        m.isEmergencyAlert ? 'border-red-400/40' : 'border-white/20'
                      } flex flex-col gap-1 text-[11px] font-bold`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          {m.actionTaken.type === 'wallet_credit' && '💰 Wallet Credited:'}
                          {m.actionTaken.type === 'full_refund' && '💳 Escrow Refunded:'}
                          {m.actionTaken.type === 'admin_escalation' && '🚨 Critical Incident Ticket:'}
                          {m.actionTaken.type === 'landmark_sent' && '📍 Landmark Pin Sent:'}
                        </span>
                        <span className="font-mono underline">
                          {m.actionTaken.amount
                            ? `₹${m.actionTaken.amount}`
                            : m.actionTaken.referenceId}
                        </span>
                      </div>
                      {m.actionTaken.details && (
                        <div className="text-[10px] opacity-80 font-normal">
                          {m.actionTaken.details}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Immediate Emergency Action Shortcuts */}
                  {m.isEmergencyAlert && (
                    <div className="mt-3 pt-2.5 border-t border-red-500/50 flex flex-wrap gap-2">
                      <a
                        href="tel:18002433767"
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Phone size={13} />
                        <span>Call 24/7 Safety Desk (1800-243-CHEF)</span>
                      </a>
                      <a
                        href="tel:112"
                        className="px-3 py-1.5 rounded-xl bg-white text-red-900 hover:bg-neutral-100 font-black text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <AlertOctagon size={13} />
                        <span>Dial Police 112</span>
                      </a>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-neutral-500 px-1 font-mono">{m.timestamp}</span>
              </div>
            );
          })}

          {isBotTyping && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 p-2">
              <Bot size={14} className="animate-spin text-amber-400" />
              <span>AI resolution engine querying telemetry & rules...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Issue Chips */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/90 space-y-2">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Instant Dispute & Issue Triggers ({selectedRole === 'customer' ? 'Customer' : 'Chef'}):</span>
            <span className="text-[9px] text-amber-400">1-Tap Resolution</span>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {selectedRole === 'customer' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Chef arrived late (Check 20m SLA)')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium cursor-pointer flex items-center gap-1"
                >
                  <Clock size={12} className="text-amber-400" />
                  <span>Chef Late (+₹150 Credit)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Chef did not show up')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw size={12} className="text-amber-400" />
                  <span>Chef No-Show (100% Refund)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Wrong ingredients or taste discrepancy')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium cursor-pointer flex items-center gap-1"
                >
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Wrong Ingredients (+₹250)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Emergency fire or physical threat')}
                  className="px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-500/50 hover:bg-red-900 text-red-300 font-bold cursor-pointer flex items-center gap-1"
                >
                  <ShieldAlert size={12} className="text-red-400" />
                  <span>Emergency Safety Alert</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Cannot find address / navigation failure')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium cursor-pointer flex items-center gap-1"
                >
                  <Navigation size={12} className="text-amber-400" />
                  <span>Navigation / Address Lost</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Host not opening door')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium cursor-pointer flex items-center gap-1"
                >
                  <AlertTriangle size={12} className="text-amber-400" />
                  <span>Host Not Opening Door</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('When will my wallet payout disburse?')}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium cursor-pointer flex items-center gap-1"
                >
                  <DollarSign size={12} className="text-emerald-400" />
                  <span>Instant IMPS Payout</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Threat or harassment emergency on site')}
                  className="px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-500/50 hover:bg-red-900 text-red-300 font-bold cursor-pointer flex items-center gap-1"
                >
                  <ShieldAlert size={12} className="text-red-400" />
                  <span>Chef Safety Alarm</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              selectedRole === 'chef'
                ? 'Type issue (e.g., "navigation failure", "uncooperative host", "emergency")...'
                : 'Type dispute (e.g., "chef late", "no-show", "wrong dish", "safety danger")...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-500"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 flex items-center justify-center cursor-pointer transition-all shrink-0 font-bold"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
