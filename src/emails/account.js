const sgMail = require('@sendgrid/mail');
const sendGridAPIKey = (process.env.SENDGRID_API_KEY);

sgMail.setApiKey(sendGridAPIKey);

const sendWelcomeEmail = async (email,name) => {
    try {
        await sgMail.send({
            to: email,
            from: 'douglaskorgutt@gmail.com',
            subject: 'Thanks for joining in!',
            text: `Welcome to the app, ${name}. Let me know how you get along with the app`
        });
    } catch (e) {
        throw new Error(e)
    }
};

const sendGoodByeEmail = async (email,password) => {
    try {
        await sgMail.send({
            to: email,
            from: 'douglaskorgutt@gmail.com',
            subject: 'Task app cancelation e-mail',
            text: 'We\'re sorry you leaving. Could we do something to make you stay?'
        })
    }  catch (e) {
        throw new Error('Error sending good-bye e-mail')
    }
};

module.exports = {
  sendWelcomeEmail,
  sendGoodByeEmail
};

