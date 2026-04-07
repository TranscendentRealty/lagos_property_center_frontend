'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiStar } from 'react-icons/fi'; // For star ratings
import { Button } from 'react-bootstrap';

interface AgentCardProps {
  agentName: string;
  agentTitle: string;
  agentImageUrl: string;
  rating: number; // e.g., 4.0
  ratingCount?: number; // Optional: (120 reviews)
  agentPhone: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ agentName, agentTitle, agentImageUrl, rating, agentPhone }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(agentPhone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0; // Check for decimal

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FiStar key={`full-${i}`} className="text-warning filled-star" fill="currentColor" />);
      } else if (i === fullStars && hasHalfStar) {
        // You might need a half-star icon or more complex logic
        stars.push(<FiStar key={`half-${i}`} className="text-warning" />); // Placeholder for half
      } else {
        stars.push(<FiStar key={`empty-${i}`} className="text-muted" />);
      }
    }
    return stars;
  };

  return (
    <div className="agent-card card shadow-sm mb-4">
      <div className="card-body d-flex align-items-center">
        <div className="agent-image-wrapper me-3">
          <Image
            src={agentImageUrl || "https://via.placeholder.com/80?text=Agent"}
            alt={agentName}
            width={80}
            height={80}
            className="rounded-circle"
            objectFit="cover"
          />
        </div>
        <div className="agent-details flex-grow-1">
          <h6 className="agent-name fw-semibold mb-0">{agentName}</h6>
          <p className="agent-title text-muted small mb-1">{agentTitle}</p>
          <p
            className="fw-normal agent-phone mb-0 text-dark"
            onClick={handleCopyPhone}
            style={{ cursor: 'pointer' }}
            title="Click to copy"
          >
            Call or Whatsapp: {agentPhone}{' '}
            <span className="text-muted small">{copied ? '✓ Copied!' : '(tap to copy)'}</span>
          </p>
        </div>
        {/* <div className="agent-rating text-end ms-auto">
          <div className="stars-container d-flex mb-1">
            {renderStars()}
          </div>
          <p className="rating-text small text-muted mb-0">{rating.toFixed(1)} rating</p>
        </div> */}
      </div>
    </div>
  );
};

export default AgentCard;