
const amqp = require('amqplib');
const crypto = require('crypto');

const RABBITMQ_URL = "amqps://xxxxxx:xxxxx@ccccccc.rmq.cloudamqp.com/tttttttt";
const QUEUE_NAME = 'otp_queue';

async function sendOtpToQueue(email) {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const message = JSON.stringify({ email, otp });

        channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });

        console.log(`✅ OTP ${otp} sent to queue for ${email}`);

        setTimeout(() => {
            connection.close();
        }, 500);

    } 
    catch (error) {
        console.error('❌ Error sending OTP:', error);
    }
}

module.exports = { sendOtpToQueue };
