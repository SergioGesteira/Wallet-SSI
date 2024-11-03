// application/src/StudentWeb.tsx
import React from 'react';
import { Container, Typography, Card  } from '@mui/material';
import { useLocation } from 'react-router-dom';


const StudentWeb: React.FC = () => {
    const location = useLocation();
    const credential = location.state?.credential;
    const claims = location.state?.claims; 
 
    const firstClaim = Array.isArray(claims) && claims.length > 0 ? claims[0] : null;
    if (!firstClaim) {
        return (
            <Container maxWidth="md" sx={{ marginTop: '4rem', textAlign: 'center' }}>
                <Typography variant="h5" color="error">No credential data available.</Typography>
            </Container>
        );
    
    }


   
  
    return (
        <Container maxWidth="md" sx={{ marginTop: '4rem', textAlign: 'center' }}>
        <Typography variant="h5">Your Verifiable Credentials</Typography>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', backgroundColor: '#f9f9f9', margin: '20px 0' }}>
            {Object.entries(firstClaim).map(([key, value]) => (
                <p key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
                </p>
            ))}
        </div>

            {/* Mostrar el DID Document */}
            <Typography variant="h5">Credential</Typography>
            <Card variant="outlined" sx={{ margin: '20px 0', padding: '20px', backgroundColor: '#f9f9f9' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {JSON.stringify(credential, null, 2)}
                </pre>
            </Card>
        </Container>
    );
};
  
  export default StudentWeb;