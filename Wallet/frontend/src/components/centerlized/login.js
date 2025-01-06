import { Button, Checkbox, Form, Input, Modal } from 'antd';
import React, { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import secureLocalStorage from 'react-secure-storage';
import axios from 'axios';
import { isExpired, decodeToken } from "react-jwt";
import { ethers } from 'ethers';
import { performDecryption } from '../../helpers/cryptoHelper';
import { useNavigate } from 'react-router-dom';


function Login({
    walletTypeChanged,
    setWalletTypeChanged,
    wallet,
    seedParse,
    setWallet,
    setSeedPharse,
    selectedChain }) {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [otpModalVisible, setOtpModalVisible] = useState(false); // State for OTP modal visibility
    const [loginOTP, setLoginOTP] = useState(null);
    const [modalError, setModalError] = useState(null);

    const onFinish = (values) => {
        try {
            setError('');
            setEmail(values.email);
            axios.post(`http://localhost:3001/login/sendOtp`, values)
                .then(response => {
                    console.log('login:', response.data);
                    setOtpModalVisible(true);
                })
                .catch(error => {
                    console.error('login:', error);
                    setOtpModalVisible(false);
                    setError('Invalid OTP')
                });
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogin = () => {
        if (email && password) {
            // Your login logic here
        } else {
            // setError('Please fill in all fields');
        }
    };

    const handleBack = () => {
        secureLocalStorage.removeItem('new-user');
        secureLocalStorage.setItem('walletType', 'centerlized');
        setWalletTypeChanged('centerlized');
        console.log(secureLocalStorage.getItem('walletType'));
    };

    const handleVerifyOTP = () => {
        try {
            axios.post(`http://localhost:3001/login/verifyOtp`, {
                email: email,
                otp: +loginOTP
            })
                .then(response => {
                    const myDecodedToken = decodeToken(response.data.data);
                    // const decoded = jwt.decode(response.data.data);
                    // Set the decoded payload (user data) in the state

                    axios.post(`http://localhost:3001/getSecret`, {
                        secretName: `${myDecodedToken.id}KEY`,
                    })
                        .then(response => {
                            let seed = performDecryption(response.data);
                            let recoveredWallet;
                            console.log(response);
                            try {
                                recoveredWallet = ethers.Wallet.fromPhrase(seed);
                            } catch (error) {
                                return;
                            }
                            secureLocalStorage.setItem('seedParse', seed);
                            secureLocalStorage.setItem('wallet', recoveredWallet.address);
                            secureLocalStorage.removeItem('accountList');
                            setSeedPharse(seed);
                            setWallet(recoveredWallet.address);
                            setOtpModalVisible(false);

                            axios.post(`http://localhost:3001/getSecret`, {
                                secretName: `${myDecodedToken.id}`,
                            })
                                .then(response => {
                                    console.log((response.data));
                                    console.log(performDecryption(response.data));
                                    secureLocalStorage.setItem('accountList', performDecryption(response.data));
                                })
                                .catch(error => {
                                    console.log(error);

                                });
                            secureLocalStorage.setItem('walletType', 'centerlized-done');
                            secureLocalStorage.setItem('email', myDecodedToken.id);
                            navigate("/centerlized-wallet-view");
                        })
                        .catch(error => {
                            console.log(error);

                        });




                })
                .catch(error => {
                    console.error('login:', error);
                    setOtpModalVisible(false);
                });

        } catch (error) {
            console.log(error);
        }
    }
    const setOTP = (value) => {
        setLoginOTP(value)
        console.log(loginOTP);
    }

    return (
        <div className="content signupForm">
            <h4>Email Login </h4>
            <Form
                name="normal_login"
                className="login-form"
                style={{ width: '100%' }}
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
            >
                <Form.Item
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your email!',
                        },
                    ]}
                >
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Password!',
                        },
                    ]}
                >
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" onClick={handleLogin}>
                        Log in
                    </Button><br />



                </Form.Item>

                <Form.Item>
                    don't have an account <a href="#" onClick={handleBack} style={{ borderBottom: '1px solid' }}>register now!</a>
                    <br />
                    <br />
                    <a className="login-form-forgot" href="" style={{ float: 'right' }}>
                        Forgot password
                    </a>

                </Form.Item>
            </Form>
            {error && <p style={{ color: 'red' }}>{error}</p>}



            <Modal
                title="Verify OTP"
                open={otpModalVisible}
                onCancel={() => setOtpModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setOtpModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="verify" type="primary" onClick={handleVerifyOTP}>
                        Verify
                    </Button>
                ]}
            >
                <Form
                    name="otp-form"
                    onFinish={(values) => {
                        console.log("OTP Values:", values);
                    }}
                >
                    <Form.Item
                        name="otp"
                        rules={[{ required: true, message: 'Please enter the OTP' }]}
                        onChange={(e) => setOTP(e.target.value)}
                    >
                        <Input placeholder="Enter OTP" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Login;
