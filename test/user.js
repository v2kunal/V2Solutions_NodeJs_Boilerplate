/* eslint-disable no-undef */
require('dotenv').config();
const chai = require('chai');
const chaihttp = require('chai-http');
const app = require('../index');
const mongoose = require('mongoose');

chai.should();
chai.use(chaihttp);

describe('Access to DB', function () {
    describe('#pass', function () {
        it('should connect with correct credentials', (done) => {
            mongoose
                .connect(process.env.MONGO_testing_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                })
                .then(() => {
                    logger.info('MongoDB testing connected Successfully');
                })
                .catch((err) => {
                    logger.error(err.message);
                });
            done();
        });
    });
});

describe('Auth Api', () => {
    describe('Sign up', () => {
        it('It should register the user', (done) => {
            chai.request(app)
                .post('/user/signup')
                .send({
                    name: 'Armaan122345',
                    email: 'armaan12232325432@gmail.com',
                    password: 'armaan@786',
                    country: 'india',
                })
                .end((error, response) => {
                    response.body.should.be.a('object');
                    response.body.should.have.property('newUser');
                    response.body.should.have.property('qrCodeUrl');
                    done();
                });
            it('It should not register the user when email already exist in system', (done) => {
                chai.request(app)
                    .post('/user/signup')
                    .send({
                        name: 'Armaan122345',
                        email: 'armaan12232325432@gmail.com',
                        password: 'armaan@786',
                        country: 'india',
                    })
                    .end((error, response) => {
                        response.body.should.be.a('object');
                        response.body.should.have
                            .property('error')
                            .eql('Email is already register');
                        done();
                    });
            });
        });
    });
    describe('Sign In', () => {
        it('It should login the user', (done) => {
            chai.request(app)
                .post('/user/login')
                .send({
                    email: 'armaan12232325432@gmail.com',
                    password: 'armaan@786',
                })
                .end((error, response) => {
                    //
                    //response.body.should.have.statusCode(200);
                    response.body.should.be.a('object');
                    response.body.should.have
                        .property('message')
                        .eql('Login successful');
                    done();
                });
        });
        it('It should not login the user when entered invalid credential', (done) => {
            chai.request(app)
                .post('/user/login')
                .send({
                    email: 'armaan12232325431@gmail.com',
                    password: 'armaan@7861',
                })
                .end((error, response) => {
                    response.body.should.be.a('object');
                    response.body.should.have
                        .property('error')
                        .eql('Invalid credentials');
                    done();
                });
        });
    });
    describe('MFA verify', () => {
        it('It should failed the google authentication when entered invalid token', (done) => {
            chai.request(app)
                .post('/user/mfa-verify')
                .send({
                    email: 'israr@gmail.com',
                    mfaToken: '123456',
                })
                .end((error, response) => {
                    //response.body.should.have.statusCode(200);
                    response.body.should.be.a('object');
                    response.body.should.have
                        .property('error')
                        .eql('Invalid token');
                    response.body.should.not.have.property('jwtToken');
                    done();
                });
        });
    });
    describe('Forget Password', () => {
        it('It should sent otp to registered email id', (done) => {
            chai.request(app)
                .post('/user/forgot-password')
                .send({
                    email: 'afsarshaikh87@gmail.com',
                })
                .end((error, response) => {
                    //response.body.should.have.statusCode(200);
                    response.body.should.be.a('object');
                    response.body.should.have
                        .property('message')
                        .eql('Reset token sent to your email');
                    done();
                });
        });
    });
    describe('Reset Password', () => {
        it('It will not reset password when enetered invalid otp', (done) => {
            chai.request(app)
                .post('/user/reset-password')
                .send({
                    otp: '123456',
                    password: 'aaaaaaaaaaaa',
                    confirmPassword: 'aaaaaaaaaaaa',
                })
                .end((error, response) => {
                    //response.body.should.have.statusCode(200);
                    response.body.should.be.a('object');
                    response.body.should.have
                        .property('error')
                        .eql('Invalid or expired OTP');
                    done();
                });
        });
    });
});
