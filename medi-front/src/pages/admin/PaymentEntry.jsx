import React, { useState, useEffect } from "react";
import { Search, CreditCard, User, AlertCircle, CheckCircle } from "lucide-react";
import { searchDoctors, getDoctorDue, deductPayment } from "../../api/adminPayment";
import LoadingScreen from "../../components/LoadingScreen";

export default function PaymentEntry() {
    /* STATE */
    const [searchQuery, setSearchQuery] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [dueDetails, setDueDetails] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState(null);

    /* SEARCH EFFECT */
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch();
            } else {
                setDoctors([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    async function performSearch() {
        try {
            setLoading(true);
            const res = await searchDoctors(searchQuery);
            setDoctors(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    }

    /* SELECT DOCTOR */
    async function handleSelectDoctor(doc) {
        setSelectedDoctor(doc);
        setDoctors([]); // Clear search results
        setSearchQuery(""); // Clear search bar
        setMessage(null);
        setPaymentAmount("");

        // Fetch Due
        try {
            setLoading(true);
            const res = await getDoctorDue(doc._id);
            setDueDetails(res);
        } catch (err) {
            console.error("Failed to fetch due", err);
        } finally {
            setLoading(false);
        }
    }

    /* SUBMIT PAYMENT */
    async function handleSubmit(e) {
        e.preventDefault();
        if (!paymentAmount || Number(paymentAmount) <= 0) return;

        if (!confirm(`Confirm payment of ₹${paymentAmount} for Dr. ${selectedDoctor.name}?`)) return;

        try {
            setProcessing(true);
            const res = await deductPayment(selectedDoctor._id, paymentAmount);

            setMessage({
                type: "success",
                text: `Payment applied! ${res.paidOrders.length} orders marked as paid. Remaining excess: ₹${res.remainingExcess}`
            });

            // Refresh due details
            const newDue = await getDoctorDue(selectedDoctor._id);
            setDueDetails(newDue);
            setPaymentAmount("");

        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Payment failed"
            });
        } finally {
            setProcessing(false);
        }
    }

    return (
        <main className="max-w-4xl mx-auto space-y-6 p-4">
            <div>
                <div className="badge mb-2">Admin</div>
                <h1 className="text-3xl font-semibold">Payment Entry</h1>
                <p className="text-muted">Record cash payments from doctors</p>
            </div>

            {/* SEARCH SECTION */}
            <section className="card space-y-4">
                <label className="text-sm font-medium">Search Doctor</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        className="input pl-10 w-full"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* RESULTS DROPDOWN */}
                {doctors.length > 0 && (
                    <div className="border rounded-md divide-y max-h-60 overflow-y-auto bg-white shadow-lg absolute w-full z-10 left-0 top-full mt-1">
                        {doctors.map((doc) => (
                            <button
                                key={doc._id}
                                className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between"
                                onClick={() => handleSelectDoctor(doc)}
                            >
                                <div>
                                    <p className="font-medium">{doc.name}</p>
                                    <p className="text-xs text-muted">{doc.email} • {doc.hospital || "No Hospital"}</p>
                                </div>
                                <User size={16} className="text-muted" />
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* PAYMENT SECTION */}
            {selectedDoctor && dueDetails && (
                <section className="card space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h2 className="text-xl font-semibold">{selectedDoctor.name}</h2>
                            <p className="text-sm text-muted">{selectedDoctor.email}</p>
                        </div>
                        <button
                            className="text-xs text-primary underline"
                            onClick={() => { setSelectedDoctor(null); setDueDetails(null); }}
                        >
                            Change Doctor
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg text-center">
                            <p className="text-xs text-orange-600 font-medium uppercase mb-1">Total Outstanding Due</p>
                            <p className="text-2xl font-bold text-orange-700">₹{dueDetails.totalDue.toFixed(2)}</p>
                            <p className="text-xs text-orange-600 mt-1">{dueDetails.pendingOrdersCount} pending orders</p>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center flex flex-col justify-center items-center">
                            <CreditCard className="text-blue-500 mb-2" size={24} />
                            <p className="text-sm text-blue-700">FIFO Payment Clearing</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount Received (Cash/Bank)</label>
                            <input
                                type="number"
                                className="input w-full text-lg"
                                placeholder="Enter amount..."
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                min="1"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-md text-sm flex items-start gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                                <p>{message.text}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="button button-primary w-full py-3 text-lg"
                            disabled={processing || !paymentAmount}
                        >
                            {processing ? "Processing..." : "Submit Payment"}
                        </button>
                    </form>
                </section>
            )}
            {/* LOADING OVERLAY */}
            {loading && <LoadingScreen />}
        </main>
    );
}
