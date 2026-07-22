'use client'
import React from 'react'

export const Logo = () => (
  <div className="logo" style={{ padding: '10px 0' }}>
    <h2 style={{ 
      fontFamily: "var(--font-header)", 
      fontWeight: 300, 
      letterSpacing: '0.08em', 
      textTransform: 'uppercase',
      fontSize: '20px',
      color: 'var(--color-primary-500)',
      lineHeight: '1.2',
      margin: 0 
    }}>
      Studio<br />Stonehewer
    </h2>
  </div>
)
