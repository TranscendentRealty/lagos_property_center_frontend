// components/home/HeroSearchPanel.tsx
'use client';

import React, { useState } from 'react';
import { Button, Card, Col, Form, Nav, Row } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import { ListingType } from '@/types/common';
import { availableLocations } from '@/exports/constants';


interface SearchPanelProps {
  // State values
  activeTab: ListingType;
  location: string;
  propertyType: string;
  bedrooms: string;
  // price: PriceRange;

  // State setter functions
  setActiveTab: React.Dispatch<React.SetStateAction<ListingType>>;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  setPropertyType: React.Dispatch<React.SetStateAction<string>>;
  setBedrooms: React.Dispatch<React.SetStateAction<string>>;
  // setPrice: React.Dispatch<React.SetStateAction<PriceRange>>;

  // You would also pass the submit handler function
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void;
}

const HeroSearchPanel: React.FC<SearchPanelProps> = ({
  activeTab,
  location,
  propertyType,
  bedrooms,
  setActiveTab,
  setLocation,
  setPropertyType,
  setBedrooms,
  handleSearch,
}) => {

  return (
    <Card className="hero-search-panel shadow-lg">
      <Card.Header className="bg-white border-0 pt-3 px-3">
        {/* Listing type tabs (currently not displayed) */}
      </Card.Header>
      <Card.Body className="p-3 p-md-4">
        <Form onSubmit={handleSearch}>
          <Row className="g-3 align-items-end">
            <Col md={6} lg={3}>
              <Form.Group controlId="formLocation">
                <Form.Label>Location</Form.Label>
                {/* <Form.Control type="text" placeholder="Search Location" value={location} onChange={e => setLocation(e.target.value)} /> */}
                <Form.Select value={location} onChange={e => setLocation(e.target.value)}>
                  <option value="">Location</option>
                  { availableLocations.map(loc => (
                    <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3}>
              <Form.Group controlId="formPropertyType">
                <Form.Label>Property Type</Form.Label>
                <Form.Select value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                  <option value="">Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="terrace">Terrace</option>
                  <option value="semi-detached">Semi-Detached</option>
                  <option value="fully detached">Fully Detached</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={2}>
              <Form.Group controlId="formBedroom">
                <Form.Label>Bedrooms</Form.Label>
                <Form.Select value={bedrooms} onChange={e => setBedrooms(e.target.value)}>
                  <option value="">Number</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {/* <Col md={6} lg={2}>
              <Form.Group controlId="formPrice">
                <Form.Label>Price</Form.Label>
                <Form.Control type="text" placeholder="Min - Max" value={`${price.min} - ${price.max}`} readOnly /> */}
            {/* A real implementation might use a dropdown with a price range slider here */}
            {/* </Form.Group>
            </Col> */}
            <Col md={6} lg={2}></Col>
            <Col xs={12} lg={2}>
              <Button variant="primary" type="submit" className="w-100 search-submit-btn">
                <FiSearch className="me-1" /> Search
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default HeroSearchPanel;