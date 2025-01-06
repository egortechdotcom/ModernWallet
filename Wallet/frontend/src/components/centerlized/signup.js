import { Button, Form, Input, Modal } from "antd";
import React, { useState } from "react";
import secureLocalStorage from "react-secure-storage";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { performEncryption, performDecryption } from '../../helpers/cryptoHelper';
function SignUp({
    setWalletTypeChanged,
    setSeedPharse,
    setWallet
}) {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const [OTP, setOTP] = useState(null);

    const [otpModalVisible, setOtpModalVisible] = useState(false); // State for OTP modal visibility
    const handleSignUp = () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (name && password) {
            // Your signup logic here
        } else {
            setError("Please fill in all fields");
        }
    };

    const handleLogin = () => {
        secureLocalStorage.setItem('new-user', true);
        secureLocalStorage.setItem('walletType', 'centerlized-login');
        setWalletTypeChanged('centerlized-login');
    };

    const handleBack = () => {
        secureLocalStorage.removeItem('new-user');
        secureLocalStorage.removeItem('walletType');
        setWalletTypeChanged(false);
    };

    const onFinish = (values) => {
        axios.post(`http://localhost:3001/register/sendOtp`, values)
            .then(response => {
                console.log('OTP sent successfully:', response.data);
                setOtpModalVisible(true);
            })
            .catch(error => {
                console.error('Error sending OTP:', error);
            });
    };

    const handleVerifyOTP = () => {
        axios.post(`http://localhost:3001/register/verifyOtp`, {
            email: email,
            otp: +OTP
        })
            .then(response => {
                secureLocalStorage.setItem('walletType', 'centerlized-done');
                secureLocalStorage.setItem('email', response.data.data._id);

                const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;

                axios.post(`http://localhost:3001/setSecret`, {
                    name: `${response.data.data._id}KEY`,
                    value: performEncryption(mnemonic)
                }).then(res => {
                    console.log('KEY SET');
                })
                    .catch(error => {
                        console.log(error);
                    })
                let recoveredWallet;
                try {
                    recoveredWallet = ethers.Wallet.fromPhrase(mnemonic);
                } catch (error) {
                    return;
                }
                secureLocalStorage.setItem('seedParse', mnemonic);
                secureLocalStorage.setItem('wallet', recoveredWallet.address);
                secureLocalStorage.removeItem('accountList');
                setSeedPharse(mnemonic);
                setWallet(recoveredWallet.address);

                navigate("/centerlized-wallet-view");
                setOtpModalVisible(false);
            })
            .catch(error => {
                console.error('Error sending OTP:', error);
            });
    };

    return (
        <div className="content content-speard">
            <Form
                name="signup-form"
                onFinish={onFinish}
                className="signupForm"
            >
                <h4>Centerlized Wallet SignUp</h4>

                <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                >
                    <Input
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                >
                    <Input
                        placeholder="Enter your email"
                        value={password}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password' }]}
                >
                    <Input.Password
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Please confirm your password' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The two passwords do not match'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Form.Item>
                {error && <p style={{ color: "red" }}>{error}</p>}

                <Form.Item>
                    <br />
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }} onClick={handleSignUp}>
                        Sign Up
                    </Button>
                    <br />
                    Or <a href="#" onClick={handleLogin} >login now!</a>
                </Form.Item>

            </Form>

            <Button onClick={handleBack}>Back</Button>
            {/* OTP Modal */}
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
                {/* Input fields for OTP verification */}
                <Form
                    name="otp-form"
                    onFinish={(values) => {
                        console.log("OTP Values:", values);
                        // Add logic to verify OTP here
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

export default SignUp;