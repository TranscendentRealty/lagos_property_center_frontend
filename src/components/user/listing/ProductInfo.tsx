import React from 'react';
import { Badge } from 'react-bootstrap';

interface ProductInfoProps {
  title: string;
  tags: string[];
  price: string | number;
  location: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ title, tags, price, location }) => {
  const keyFeatures = [
    'gym',
    'swimming pool',
    'elevator',
    'inbuilt speakers',
    'fully fitted kitchen'
  ]

  return (
    <div className="product-info-section mb-4">
      <h1 className="product-title display-5 fw-bold mb-2">{title}</h1>
      <div className="tags-container mb-3">
        {tags.map((tag, index) => {
          if (keyFeatures.includes(tag.toLowerCase())) {
            return (
              <Badge key={index} pill bg="success-subtle" text="success-emphasis" className="me-2 mb-2 p-2 px-3 product-tag">
                {tag}
              </Badge>
            )
          }
        })}
      </div>
      <p className="product-price display-4 fw-bolder mb-1">₦{price.toLocaleString()}</p>
      <p className="product-location text-muted">{location}</p>
    </div>
  );
};

export default ProductInfo;