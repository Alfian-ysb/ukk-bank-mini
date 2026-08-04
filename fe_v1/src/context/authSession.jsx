import React from 'react'

export const getStoredRole = () => {
  return (sessionStorage.getItem('role') || "").toLowerCase();
}

export const getStoredToken = () => {
    return sessionStorage.getItem('token') || "";
}

export const isLoggedIn = () => {
    return Boolean(getStoredToken());
}

export const getRoleFromResponse = (payload, fallback = "applicant") => {
    const roleValue = payload?.data?.role || fallback;
    return String(roleValue).toLowerCase();
}

export const getRouteByRole = (role) => {
    switch (role) {
        case "admin":
            return "/admin/dashboard";
        case "analyst":
            return "/analyst/dashboard";
        case "verifier":
            return "/verifier/dashboard";
        case "manager":
            return "/manager/dashboard";
        case "applicant":
            return "/applicant/dashboard";
        default:
            return "/";
    }
} 