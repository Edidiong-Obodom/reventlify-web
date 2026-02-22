"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Plus,
  ReceiptText,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

interface OwnerRegimeDashboardPageProps {
  regimeId: string;
}

type RegimeStatus = "ongoing" | "upcoming" | "ended";
type AccessRole =
  | "creator"
  | "super_admin"
  | "admin"
  | "bouncer"
  | "usher"
  | "marketer";
type AssignableRole = "super_admin" | "admin" | "bouncer" | "usher" | "marketer";

type TransactionItem = {
  id: string;
  time: string;
  type: "ticket_sale" | "wallet_transfer";
  actor: string;
  amount: number;
  channel: string;
  note: string;
};

type ParticipantState = {
  super_admin: string[];
  admin: string[];
  bouncer: string[];
  usher: string[];
  marketer: string[];
};

export default function OwnerRegimeDashboardPage({
  regimeId,
}: Readonly<OwnerRegimeDashboardPageProps>) {
  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("150000");
  const [transferType, setTransferType] = useState<"external" | "internal">(
    "external",
  );
  const [externalAccountNumber, setExternalAccountNumber] = useState("");
  const [externalBankName, setExternalBankName] = useState("");
  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [internalRecipientMode, setInternalRecipientMode] = useState<
    "email" | "participant"
  >("email");
  const [internalRecipientEmail, setInternalRecipientEmail] = useState("");
  const [selectedParticipantRecipient, setSelectedParticipantRecipient] =
    useState("");
  const [currentRole, setCurrentRole] = useState<AccessRole>("creator");

  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [participantRole, setParticipantRole] = useState<AssignableRole>("admin");
  const [pendingRemoval, setPendingRemoval] = useState<{
    role: AssignableRole;
    name: string;
  } | null>(null);

  // UI-only mock data. Replace with API data when backend endpoints are wired.
  const dashboard = useMemo(() => {
    const status = (["ongoing", "upcoming", "ended"] as RegimeStatus[])[0];
    const soldTickets = 378;
    const totalTickets = 500;
    const ticketsLeft = totalTickets - soldTickets;
    const grossAmount = 4_213_500;
    const transferFees = 98_250;
    const netAmount = grossAmount - transferFees;

    const transactions: TransactionItem[] = [
      {
        id: "TXN-1JH9P2",
        time: "10:42 AM",
        type: "ticket_sale",
        actor: "Ada Samuel",
        amount: 12500,
        channel: "Card",
        note: "VIP ticket sale",
      },
      {
        id: "TXN-1JH9P9",
        time: "11:07 AM",
        type: "ticket_sale",
        actor: "Adebayo T.",
        amount: 8500,
        channel: "Transfer",
        note: "Regular ticket sale",
      },
      {
        id: "TXN-1JHAA2",
        time: "11:31 AM",
        type: "wallet_transfer",
        actor: "Reventlify Wallet",
        amount: -125000,
        channel: "Debit",
        note: "Payout transfer to owner bank account",
      },
      {
        id: "TXN-1JHAB1",
        time: "12:03 PM",
        type: "ticket_sale",
        actor: "Mariam O.",
        amount: 8500,
        channel: "Card",
        note: "Regular ticket sale",
      },
    ];

    return {
      name: "Summer Pulse Fest",
      status,
      startDate: "May 10, 2026",
      startTime: "2:00 PM",
      soldTickets,
      totalTickets,
      ticketsLeft,
      grossAmount,
      transferFees,
      netAmount,
      participants: {
        super_admin: ["Amaka S."],
        admin: ["Kelvin M.", "Anita C."],
        bouncer: ["Bouncer 1", "Bouncer 2", "Bouncer 3"],
        usher: ["Jude K.", "Lydia A."],
        marketer: ["Seyi A."],
      } as ParticipantState,
      attendance: {
        totalCheckedIn: 211,
        steppedOut: 19,
        yetToAttend: 148,
        checkedInList: ["Ada Samuel", "Adebayo T.", "Mariam O.", "Tim O."],
        steppedOutList: ["Moses D.", "Ijeoma K."],
        yetToAttendList: ["Tolu B.", "Nenye A.", "Hassan M."],
      },
      transactions,
    };
  }, []);

  const [participants, setParticipants] = useState<ParticipantState>(dashboard.participants);

  const isCreatorOrSuper = currentRole === "creator" || currentRole === "super_admin";
  const isAdmin = currentRole === "admin";
  const isBouncerOrUsher = currentRole === "bouncer" || currentRole === "usher";
  const isMarketer = currentRole === "marketer";

  const canSeeFinancialData = isCreatorOrSuper;
  const canTransferFunds = isCreatorOrSuper;
  const canManageParticipants = isCreatorOrSuper || isAdmin;

  const assignableRoles: AssignableRole[] = isCreatorOrSuper
    ? ["super_admin", "admin", "usher", "bouncer", "marketer"]
    : ["admin", "usher", "bouncer", "marketer"];

  const soldPct = Math.round((dashboard.soldTickets / dashboard.totalTickets) * 100);
  const totalParticipantCount =
    participants.super_admin.length +
    participants.admin.length +
    participants.bouncer.length +
    participants.usher.length +
    participants.marketer.length;
  const participantRecipientOptions = useMemo(() => {
    const grouped: Array<{ role: AssignableRole; names: string[] }> = [
      { role: "super_admin", names: participants.super_admin },
      { role: "admin", names: participants.admin },
      { role: "usher", names: participants.usher },
      { role: "bouncer", names: participants.bouncer },
      { role: "marketer", names: participants.marketer },
    ];

    return grouped.flatMap((group) =>
      group.names.map((name) => ({
        value: `${group.role}:${name}`,
        label: `${name} (${group.role})`,
      })),
    );
  }, [participants]);

  const statusTone =
    dashboard.status === "ongoing"
      ? "bg-emerald-100 text-emerald-700"
      : dashboard.status === "upcoming"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-700";

  const weeklySales = [
    { day: "Mon", sold: 24 },
    { day: "Tue", sold: 31 },
    { day: "Wed", sold: 27 },
    { day: "Thu", sold: 42 },
    { day: "Fri", sold: 58 },
    { day: "Sat", sold: 73 },
    { day: "Sun", sold: 65 },
  ];
  const maxWeeklySales = Math.max(...weeklySales.map((item) => item.sold), 1);

  const resolveAccountName = async (
    accountNumber: string,
    bankName: string,
  ): Promise<string> => {
    // Placeholder for real account-resolution API integration.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `${bankName.toUpperCase()} USER`;
  };

  const removeParticipant = (role: AssignableRole, name: string) => {
    setParticipants((prev) => ({
      ...prev,
      [role]: prev[role].filter((item) => item !== name),
    }));
    setPendingRemoval(null);
  };

  const handleAddParticipant = () => {
    const name = participantName.trim();
    if (!name) return;

    if (!assignableRoles.includes(participantRole)) {
      return;
    }

    setParticipants((prev) => ({
      ...prev,
      [participantRole]: [name, ...prev[participantRole]],
    }));
    setParticipantName("");
    setParticipantRole(isCreatorOrSuper ? "super_admin" : "admin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4FBFA] via-white to-white">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-gray-700 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <p className="text-sm text-gray-500">Regime Dashboard</p>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{dashboard.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as AccessRole)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
              title="UI-only role preview"
            >
              <option value="creator">creator</option>
              <option value="super_admin">super_admin</option>
              <option value="admin">admin</option>
              <option value="bouncer">bouncer</option>
              <option value="usher">usher</option>
              <option value="marketer">marketer</option>
            </select>
            <span className={`px-3 py-1 text-sm rounded-full font-semibold ${statusTone}`}>
              {dashboard.status}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {(isCreatorOrSuper || isAdmin || isMarketer) && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {canSeeFinancialData && (
              <StatCard
                title="Net Amount Made"
                value={`₦${dashboard.netAmount.toLocaleString()}`}
                icon={<CircleDollarSign className="w-5 h-5" />}
                hint={`Gross: ₦${dashboard.grossAmount.toLocaleString()}`}
              />
            )}

            <StatCard
              title="Tickets Sold"
              value={`${dashboard.soldTickets}`}
              icon={<Ticket className="w-5 h-5" />}
              hint={`${dashboard.ticketsLeft} left`}
            />

            {!isMarketer && (
              <StatCard
                title="Total Transactions"
                value={`${dashboard.transactions.length}`}
                icon={<ReceiptText className="w-5 h-5" />}
                hint="Sales + transfer debits"
              />
            )}

            {!isMarketer && (
              <StatCard
                title="Participants"
                value={`${totalParticipantCount}`}
                icon={<Users className="w-5 h-5" />}
                hint="All assigned roles"
              />
            )}
          </section>
        )}

        {(isCreatorOrSuper || isAdmin || isMarketer) && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h2 className="text-lg font-semibold">Ticket Performance</h2>
                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{dashboard.startDate}</span>
                  <Clock3 className="w-4 h-4 ml-2" />
                  <span>{dashboard.startTime}</span>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Sold Progress</span>
                <span className="text-sm font-medium text-gray-800">{soldPct}%</span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0F766E] to-[#22C55E]"
                  style={{ width: `${soldPct}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <MiniCell label="Total" value={`${dashboard.totalTickets}`} />
                <MiniCell label="Sold" value={`${dashboard.soldTickets}`} />
                <MiniCell label="Left" value={`${dashboard.ticketsLeft}`} />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Weekly Ticket Sales
                  </h3>
                  <span className="text-xs text-gray-500">This week</span>
                </div>
                <div className="rounded-xl border border-gray-100 p-3">
                  <div className="grid grid-cols-7 gap-2 items-end h-28">
                    {weeklySales.map((item) => (
                      <div key={item.day} className="flex flex-col items-center gap-1">
                        <div className="w-full h-20 flex items-end">
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-[#0F766E] to-[#22C55E]"
                            style={{
                              height: `${Math.max(
                                10,
                                Math.round((item.sold / maxWeeklySales) * 100),
                              )}%`,
                            }}
                            title={`${item.sold} sold`}
                          />
                        </div>
                        <span className="text-[11px] text-gray-500">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {!isMarketer && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Transfer Funds</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Transfer earnings externally or internally to a user.
                </p>
                {canTransferFunds ? (
                  <>
                    <div className="inline-flex rounded-full bg-gray-100 p-1 gap-1 mb-3 w-full">
                      <button
                        onClick={() => setTransferType("external")}
                        className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          transferType === "external"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        External
                      </button>
                      <button
                        onClick={() => setTransferType("internal")}
                        className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          transferType === "internal"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600"
                        }`}
                      >
                        Internal
                      </button>
                    </div>

                    <label className="text-sm font-medium text-gray-700">Amount</label>
                    <input
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                    />

                    {transferType === "external" ? (
                      <>
                        <label className="text-sm font-medium text-gray-700">
                          Account Number
                        </label>
                        <input
                          value={externalAccountNumber}
                          onChange={(e) => {
                            setExternalAccountNumber(e.target.value);
                            setResolvedAccountName("");
                          }}
                          placeholder="Enter account number"
                          className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Bank Name
                        </label>
                        <input
                          value={externalBankName}
                          onChange={(e) => {
                            setExternalBankName(e.target.value);
                            setResolvedAccountName("");
                          }}
                          placeholder="Enter bank name"
                          className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                        />
                        <button
                          type="button"
                          disabled={
                            isResolvingAccount ||
                            externalAccountNumber.trim().length < 10 ||
                            !externalBankName.trim()
                          }
                          onClick={async () => {
                            setIsResolvingAccount(true);
                            const accountName = await resolveAccountName(
                              externalAccountNumber.trim(),
                              externalBankName.trim(),
                            );
                            setResolvedAccountName(accountName);
                            setIsResolvingAccount(false);
                          }}
                          className="w-full mb-3 px-3 py-2 rounded-lg border border-[#0F766E] text-[#0F766E] disabled:opacity-50"
                        >
                          {isResolvingAccount
                            ? "Resolving account..."
                            : "Resolve Account Name"}
                        </button>
                        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                          <p className="text-xs text-gray-500">Account Name</p>
                          <p className="text-sm font-medium text-gray-800">
                            {resolvedAccountName || "Not resolved yet"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="inline-flex rounded-full bg-gray-100 p-1 gap-1 mb-3 w-full">
                          <button
                            onClick={() => setInternalRecipientMode("email")}
                            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              internalRecipientMode === "email"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600"
                            }`}
                          >
                            By Email
                          </button>
                          <button
                            onClick={() => setInternalRecipientMode("participant")}
                            className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              internalRecipientMode === "participant"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600"
                            }`}
                          >
                            From Participants
                          </button>
                        </div>

                        {internalRecipientMode === "email" ? (
                          <>
                            <label className="text-sm font-medium text-gray-700">
                              Recipient Email
                            </label>
                            <input
                              type="email"
                              value={internalRecipientEmail}
                              onChange={(e) =>
                                setInternalRecipientEmail(e.target.value)
                              }
                              placeholder="Enter recipient email"
                              className="w-full mt-1 mb-4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                            />
                          </>
                        ) : (
                          <>
                            <label className="text-sm font-medium text-gray-700">
                              Select Participant
                            </label>
                            <select
                              value={selectedParticipantRecipient}
                              onChange={(e) =>
                                setSelectedParticipantRecipient(e.target.value)
                              }
                              className="w-full mt-1 mb-4 px-3 py-2 rounded-lg border border-gray-300 bg-white"
                            >
                              <option value="">Choose participant</option>
                              {participantRecipientOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                      </>
                    )}

                    <button className="w-full flex items-center justify-center gap-2 bg-[#0F766E] text-white py-2.5 rounded-lg hover:bg-[#0D665F] transition-colors">
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>
                        {transferType === "external" ? "Transfer" : "Send"} ₦
                        {Number(payoutAmount || 0).toLocaleString()}
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    You do not have permission to transfer funds.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {(isCreatorOrSuper || isAdmin) && (
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h2 className="text-lg font-semibold">Regime Participants</h2>
              {canManageParticipants && (
                <button
                  onClick={() => setShowAddParticipant((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 text-sm bg-[#0F766E] text-white px-3 py-2 rounded-lg hover:bg-[#0D665F] transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddParticipant ? "Close" : "Add Participant"}</span>
                </button>
              )}
            </div>

            {showAddParticipant && canManageParticipants && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Participant name"
                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                  />
                  <select
                    value={participantRole}
                    onChange={(e) => setParticipantRole(e.target.value as AssignableRole)}
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  >
                    {assignableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddParticipant}
                    className="bg-white border border-[#0F766E] text-[#0F766E] px-3 py-2 rounded-lg hover:bg-[#0F766E]/5 transition-colors"
                  >
                    Save Participant
                  </button>
                </div>
              </div>
            )}

            {pendingRemoval && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="text-sm text-rose-700">
                  Remove <span className="font-semibold">{pendingRemoval.name}</span> from{" "}
                  {pendingRemoval.role}s?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPendingRemoval(null)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => removeParticipant(pendingRemoval.role, pendingRemoval.name)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    Confirm Remove
                  </button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RoleCard
                role="Super Admins"
                roleKey="super_admin"
                names={participants.super_admin}
                canRemove={canManageParticipants}
                onRemove={(name) => setPendingRemoval({ role: "super_admin", name })}
              />
              <RoleCard
                role="Admins"
                roleKey="admin"
                names={participants.admin}
                canRemove={canManageParticipants}
                onRemove={(name) => setPendingRemoval({ role: "admin", name })}
              />
              <RoleCard
                role="Bouncers"
                roleKey="bouncer"
                names={participants.bouncer}
                canRemove={canManageParticipants}
                onRemove={(name) => setPendingRemoval({ role: "bouncer", name })}
              />
              <RoleCard
                role="Ushers"
                roleKey="usher"
                names={participants.usher}
                canRemove={canManageParticipants}
                onRemove={(name) => setPendingRemoval({ role: "usher", name })}
              />
              <RoleCard
                role="Marketers"
                roleKey="marketer"
                names={participants.marketer}
                canRemove={canManageParticipants}
                onRemove={(name) => setPendingRemoval({ role: "marketer", name })}
              />
            </div>
          </section>
        )}

        {(dashboard.status === "ongoing" || dashboard.status === "ended" || isBouncerOrUsher) && (
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <button
              onClick={() => setShowAttendanceDetails((prev) => !prev)}
              className="w-full flex items-start sm:items-center justify-between text-left gap-3"
            >
              <div>
                <h2 className="text-lg font-semibold">Venue Attendance Monitor</h2>
                <p className="text-sm text-gray-600">
                  Track checked-in guests, step-outs, and pending attendance.
                </p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  showAttendanceDetails ? "rotate-180" : ""
                }`}
              />
            </button>

            {dashboard.status === "upcoming" ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Attendance metrics will be available after event check-in starts.
              </div>
            ) : (
              showAttendanceDetails && (
                <div className="mt-4 grid lg:grid-cols-3 gap-4">
                  <AttendanceCard
                    label={`Present (${dashboard.attendance.totalCheckedIn})`}
                    names={dashboard.attendance.checkedInList}
                    tone="text-emerald-700 bg-emerald-50 border-emerald-200"
                    href={`/regimes/${regimeId}/attendance?filter=present`}
                  />
                  <AttendanceCard
                    label={`Stepped Out (${dashboard.attendance.steppedOut})`}
                    names={dashboard.attendance.steppedOutList}
                    tone="text-amber-700 bg-amber-50 border-amber-200"
                    href={`/regimes/${regimeId}/attendance?filter=stepped-out`}
                  />
                  <AttendanceCard
                    label={`Yet To Attend (${dashboard.attendance.yetToAttend})`}
                    names={dashboard.attendance.yetToAttendList}
                    tone="text-slate-700 bg-slate-50 border-slate-200"
                    href={`/regimes/${regimeId}/attendance?filter=yet-to-attend`}
                  />
                </div>
              )
            )}
          </section>
        )}

        {canSeeFinancialData && (
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-1">
              <h2 className="text-lg font-semibold">Transaction History</h2>
              <span className="text-xs text-gray-500">Regime: {regimeId}</span>
            </div>
            <div className="space-y-3">
              {dashboard.transactions.map((txn) => {
                const isSale = txn.type === "ticket_sale";
                return (
                  <div
                    key={txn.id}
                    className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{txn.note}</p>
                      <p className="text-sm text-gray-500">
                        {txn.id} • {txn.time} • {txn.actor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          isSale ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isSale ? "+" : "-"}₦{Math.abs(txn.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{txn.channel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="text-[#0F766E]">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{hint}</p>
    </div>
  );
}

function MiniCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function RoleCard({
  role,
  roleKey,
  names,
  canRemove,
  onRemove,
}: {
  role: string;
  roleKey: AssignableRole;
  names: string[];
  canRemove: boolean;
  onRemove: (name: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <p className="font-medium text-gray-800 mb-3">{role}</p>
      <div className="space-y-2">
        {names.map((name) => (
          <div
            key={`${roleKey}-${name}`}
            className="flex items-center justify-between gap-2 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
              <span>{name}</span>
            </div>
            {canRemove && (
              <button
                onClick={() => onRemove(name)}
                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700"
                title={`Remove ${name}`}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs">Remove</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceCard({
  label,
  names,
  tone,
  href,
}: {
  label: string;
  names: string[];
  tone: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <div className={`rounded-xl border p-4 ${tone} hover:opacity-90 transition-opacity`}>
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          {names.map((name) => (
            <p key={name}>{name}</p>
          ))}
        </div>
      </div>
    </Link>
  );
}
