import React from 'react'
import { Link } from "react-router-dom";

function AuthLayout({ title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText,}) {
  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <div className="brand-logo">
            H
          </div>

          <div>
            <h2>HRMS</h2>
            <span>Human Resource Management</span>
          </div>
        </div>

        <div className="auth-card">

          <div className="auth-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
{children}

          <div className="auth-footer">
            <span>{footerText}</span>

            <Link to={footerLink}>
              {footerLinkText}
            </Link>
          </div>

        </div>

        <p className="copyright">
          © {new Date().getFullYear()} HRMS.
          All rights reserved.
        </p>

      </div>
    </div>
  )
}

export default AuthLayout
