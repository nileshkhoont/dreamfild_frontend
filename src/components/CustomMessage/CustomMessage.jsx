import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Box,
    Typography,
    Button,
    Paper,
    Snackbar,
    Alert,
    Tabs,
    Tab,
} from '@mui/material';
import { useSendMessageMutation, useShowMessageQuery } from '../../apiService';
import { LoaderCircle, MessageSquare, Send } from 'lucide-react';
import { CustomLoader, LoaderContainer } from '../Layout/CustomLoader';

const tabLabels = ['Birthday', 'Anniversary', 'Festival'];
const fieldMap = ['birthdayMessage', 'anniversaryMessage', 'festivalMessage'];
const placeholders = [
    'Write your birthday wish here...',
    'Write your work anniversary wish here...',
    'Write your festival wish here...'
];

const CustomMessage = () => {
    const { data, isLoading } = useShowMessageQuery();
    const [messages, setMessages] = useState({
        birthdayMessage: '',
        anniversaryMessage: '',
        festivalMessage: '',
    });
    const [tabIndex, setTabIndex] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [sendCustomMessages, { isLoading: isSending }] = useSendMessageMutation();

    // Listen for API changes and update messages live
    useEffect(() => {
        if (data) {
            setMessages({
                birthdayMessage: data.birthdayMessage || '',
                anniversaryMessage: data.anniversaryMessage || '',
                festivalMessage: (data.festivalMessage || '').replace(/\n/g, '<br>'),
            });
        }
    }, [data]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleQuillChange = (field, value) => {
        setMessages((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSend = async () => {
        // Convert <br> back to \n before sending to DB
        const payload = {
            ...messages,
            festivalMessage: messages.festivalMessage.replace(/<br\s*\/?>(\s*)/gi, '\n'),
        };
        const { birthdayMessage, anniversaryMessage, festivalMessage } = payload;
        if (!birthdayMessage && !anniversaryMessage && !festivalMessage) {
            setSnackbar({
                open: true,
                message: 'Please enter at least one message.',
                severity: 'warning',
            });
            return;
        }
        try {
            const res = await sendCustomMessages(payload).unwrap();
            setSnackbar({
                open: true,
                message: res?.responseMessage || res?.message || 'Messages sent successfully!',
                severity: 'success',
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: err?.data?.responseMessage || err?.data?.message || 'Failed to send messages.',
                severity: 'error',
            });
        }
    };

    if (isLoading) {
        return (
            <LoaderContainer>
                <CustomLoader />
            </LoaderContainer>
        );
    }
    // const Container = styled(Box)({
    //   // maxWidth: 1400,
    //   margin: "0 auto",
    //   paddingTop: "2rem",
    // });
    

    return (
        <Box sx={{ 
            // maxWidth: 1400, 
            width: '100%', 
            mx: 'auto', 
             paddingTop: "2rem",
            mt: 4, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 'calc(100vh - 120px)', // Add minimum height to fill viewport
        }}>
            <Paper
                elevation={0} 
                sx={{
                    p: 0,
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                    // boxShadow: 'var(--cardBoxShadow)',
                    backgroundColor: '#ffffff',
                    width: '100%',
                    overflow: 'visible',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1, 
                }}
            >
                <Box sx={{ p: 3, pb: 0, pt: 2, px: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            minHeight: 48,
                        }}
                    >
                        <MessageSquare size={22} color="var(--textColor)" />
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                color: "var(--textColor)",
                                textAlign: "left",
                                lineHeight: 1.2,
                                fontSize: "22px",
                            }}
                            component="span"
                        >
                            Customized Message
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ 
                    px: 3, 
                    pt: 0, 
                    pb: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1, // Make content grow to fill available space
                }}>
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        TabIndicatorProps={{
                            style: { backgroundColor: 'var(--purpleShadeBg)' }
                        }}
                        textColor="primary"
                        sx={{
                            mb: 3,
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            '& .MuiTabs-flexContainer': {
                                justifyContent: 'center',
                            },
                            '& .MuiTab-root': {
                                fontWeight: 500,
                                color: 'var(--textColor)',
                            },
                            '& .Mui-selected': {
                                fontWeight: 700,
                                color: 'var(--purpleShadeBg) !important',
                            },
                        }}
                    >
                        {tabLabels.map((label, index) => (
                            <Tab key={label} label={label} />
                        ))}
                    </Tabs>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        flexGrow: 1 // Make the tab content area expand
                    }}>
                        {fieldMap.map((field, index) => (
                            tabIndex === index && (
                                <Box key={field} sx={{ 
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexGrow: 1,
                                }}>
                                    <ReactQuill
                                        theme="snow"
                                        value={messages[field]}
                                        onChange={(value) => handleQuillChange(field, value)}
                                        placeholder={placeholders[index]}
                                        style={{
                                            marginBottom: 32,
                                            background: '#f7f9fc',
                                            borderRadius: 8,
                                            border: '1.5px solid #e0e0e0',
                                            minHeight: 320, // Increased editor height
                                            boxShadow: '0 2px 8px rgba(114, 103, 240, 0.04)',
                                            fontFamily: 'inherit',
                                            width: '100%',
                                            flex: '1 0 auto', // Allow editor to grow
                                        }}
                                        modules={{
                                            toolbar: [
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'color': [] }, { 'background': [] }],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                [{ 'align': [] }],
                                            ]
                                        }}
                                        className="custom-quill"
                                    />
                                </Box>
                            )
                        ))}
                    </Box>
                    <Box display="flex" justifyContent="flex-start" mt={4} sx={{ width: '100%' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{
                                backgroundColor: 'var(--purpleShadeBg)',
                                color: 'white',
                                borderRadius: 2,
                                fontWeight: 'bold',
                                fontSize: '15px',
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                minWidth: '120px',
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: 'var(--purpleShadeBg)',
                                    boxShadow: 'none',
                                },
                            }}
                            disabled={isSending}
                            onClick={handleSend}
                        >
                            {isSending ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                    <style>{`
                                        @keyframes spin {
                                            0% { transform: rotate(0deg); }
                                            100% { transform: rotate(360deg); }
                                        }
                                    `}</style>
                                </span>
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </Box>
                </Box>
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CustomMessage;

