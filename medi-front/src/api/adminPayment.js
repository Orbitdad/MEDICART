import client from "./client";

/* SEARCH DOCTORS */
export const searchDoctors = async (query) => {
    return client.get(`/admin/payments/doctors?q=${encodeURIComponent(query)}`);
};

/* GET DOCTOR DUE */
export const getDoctorDue = async (doctorId) => {
    return client.get(`/admin/payments/doctors/${doctorId}/due`);
};

/* DEDUCT PAYMENT */
export const deductPayment = async (doctorId, amount) => {
    return client.post("/admin/payments/deduct", { doctorId, amount });
};
