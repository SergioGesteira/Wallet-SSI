import React, { useEffect } from 'react';
import { Container, Typography, Card } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import React Toastify for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const StudentWeb: React.FC = () => {
    const location = useLocation();
    const credential = location.state?.credential; // Retrieve credential data from navigation state
    const claims = location.state?.claims; // Retrieve claims from navigation state

    // Extract the first claim if available
    const firstClaim = Array.isArray(claims) && claims.length > 0 ? claims[0] : null;

    // Show a notification based on whether claim data is available
    useEffect(() => {
        if (!firstClaim) {
            toast.error('No credential data available.'); // Show error if no claim data
        } else {
            toast.success('Credential data loaded successfully.'); // Success notification if data is available
        }
    }, [firstClaim]);

    // Render message if no credential data is available
    if (!firstClaim) {
        return (
            <Container maxWidth="md" sx={{ marginTop: '4rem', textAlign: 'center' }}>
                <Typography variant="h5" color="error">No credential data available.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ marginTop: '4rem', textAlign: 'center' }}>
            {/* Display header for credentials section */}
            <Typography variant="h5">Your Verifiable Credentials</Typography>

            {/* Display each claim as key-value pairs */}
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', backgroundColor: '#f9f9f9', margin: '20px 0' }}>
                {Object.entries(firstClaim).map(([key, value]) => (
                    <p key={key}>
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
                    </p>
                ))}
            </div>

            {/* Display the full credential in JSON format */}
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
