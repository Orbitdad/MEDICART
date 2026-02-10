import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="medicart-footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-col">
          <h3 className="footer-brand">MediCart</h3>
          <p className="footer-text">
            A centralized medical supply ordering platform for doctors and
            healthcare providers.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/doctor/home">Doctor Dashboard</Link>
            </li>
            <li>
              <Link to="/doctor/orders">My Orders</Link>
            </li>
            {/* Placeholder links – pages not yet implemented */}
            <li>
              <button className="footer-link-button" type="button" disabled>
                Contact Support
              </button>
            </li>
            <li>
              <button className="footer-link-button" type="button" disabled>
                About MediCart
              </button>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
            <li><a href="/refund-policy">Refund Policy</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-col">
          <h4>Support</h4>
          <p>
            Email:{" "}
            <a href="mailto:support@medicart.com">
              support@medicart.com
            </a>
          </p>
          <p>Mon – Sat: 9:00 AM – 7:00 PM</p>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} MediCart. All rights reserved.
      </div>
    </footer>
  );
}
