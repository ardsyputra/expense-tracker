const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// =========================
// TYPES
// =========================

type ApiResponse<T = unknown> = {
success: boolean;
message: string;
data?: T;
};

export type LoginResponse = {
token: string;
};

export type Profile = {
id: number;
name: string;
email: string;
};

export type DashboardSummary = {
total_income: number;
total_expense: number;
balance: number;
};

export type Category = {
id: number;
name: string;
};

export type Transaction = {
id: number;
amount: number;
description: string;
type: "income" | "expense";
category_id?: number;
category?: Category;
created_at?: string;
};

// =========================
// API REQUEST
// =========================

async function request<T>(
endpoint: string,
options: RequestInit = {}
): Promise<ApiResponse<T>> {
const url = `${API_URL}${endpoint}`;

console.log("================================");
console.log("API REQUEST");
console.log("URL:", url);
console.log("METHOD:", options.method || "GET");
console.log("================================");

try {
const response = await fetch(url, {
...options,
headers: {
"Content-Type": "application/json",
...(options.headers || {}),
},
});


console.log("API RESPONSE");
console.log("STATUS:", response.status);
console.log("OK:", response.ok);

let data: ApiResponse<T>;

try {
  data = await response.json();
} catch {
  throw new Error("Server mengembalikan response yang tidak valid");
}

console.log("RESPONSE DATA:", data);

if (!response.ok) {
  throw new Error(
    data.message || `Request gagal (${response.status})`
  );
}

return data;


} catch (error) {
console.error("================================");
console.error("API ERROR");
console.error("URL:", url);
console.error("ERROR:", error);
console.error("================================");


if (error instanceof TypeError) {
  throw new Error(
      `Gagal terhubung ke server. Pastikan backend Go berjalan di ${API_URL} dan CORS sudah diizinkan.`
  );
}

if (error instanceof Error) {
  throw error;
}

throw new Error("Terjadi kesalahan pada request");


}
}

// =========================
// AUTH
// =========================

export async function login(
email: string,
password: string
) {
return request<LoginResponse>("/api/auth/login", {
method: "POST",


body: JSON.stringify({
  email,
  password,
}),


});
}

export async function register(
email: string,
name: string,
password: string
) {
return request("/api/auth/register", {
method: "POST",


body: JSON.stringify({
  email,
  name,
  password,
}),


});
}

// =========================
// PROFILE
// =========================

export async function getProfile(token: string) {
return request<Profile>("/api/profile", {
method: "GET",


headers: {
  Authorization: `Bearer ${token}`,
},


});
}

export async function updateProfile(
  token: string,
  data: {
    email: string;
    current_password?: string;
    new_password?: string;
  }
) {
  return request<Profile>("/api/profile", {
    method: "PUT",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(data),
  });
}
// =========================
// DASHBOARD
// =========================

export async function getDashboardSummary(
token: string
) {
return request<DashboardSummary>(
"/api/dashboard/summary",
{
method: "GET",


  headers: {
    Authorization: `Bearer ${token}`,
  },
}


);
}

// =========================
// CATEGORIES
// =========================

export async function getCategories(
token: string
) {
return request<Category[]>("/api/categories", {
method: "GET",


headers: {
  Authorization: `Bearer ${token}`,
},


});
}

// =========================
// TRANSACTIONS
// =========================

export async function getTransactions(
token: string
) {
return request<Transaction[]>(
"/api/transactions",
{
method: "GET",


  headers: {
    Authorization: `Bearer ${token}`,
  },
}


);
}

// =========================
// CREATE TRANSACTION
// =========================

export async function createTransaction(
token: string,
transaction: {
amount: number;
description: string;
type: "income" | "expense";
category_id?: number;
}
) {
return request<Transaction>(
"/api/transactions",
{
method: "POST",


  headers: {
    Authorization: `Bearer ${token}`,
  },

  body: JSON.stringify(transaction),
}


);
}

// =========================
// DELETE TRANSACTION
// =========================

export async function deleteTransaction(
token: string,
id: number
) {
return request(
`/api/transactions/${id}`,
{
method: "DELETE",


  headers: {
    Authorization: `Bearer ${token}`,
  },
}


);
}

// =========================
// UPDATE TRANSACTION
// =========================

export async function updateTransaction(
token: string,
id: number,
transaction: {
amount?: number;
description?: string;
type?: "income" | "expense";
category_id?: number;
}
) {
return request<Transaction>(
`/api/transactions/${id}`,
{
method: "PUT",


  headers: {
    Authorization: `Bearer ${token}`,
  },

  body: JSON.stringify(transaction),
}


);
}
