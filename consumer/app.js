const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const RABBITMQ_URL = "amqps://xxxxxx:xxxxx@ccccccc.rmq.cloudamqp.com/tttttttt";
const QUEUE_NAME = 'otp_queue';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "youremail@gmail.com",
        pass: "-------------"
    },
});

async function consumeOtpQueue() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log('📩 Waiting for messages...');

        channel.consume(
            QUEUE_NAME,
            async (msg) => {
                if (msg !== null) {
                    const { email, otp } = JSON.parse(msg.content.toString());
                    console.log(`📩 Received OTP ${otp} for ${email}`);

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: 'Your OTP Code',
                        text: `Your OTP is: ${otp}`,
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                        console.log(`📧 OTP ${otp} sent to ${email}`);

                        channel.ack(msg); // Acknowledge message after sending
                    } catch (emailError) {
                        console.error('❌ Error sending email:', emailError);
                        channel.nack(msg); // Requeue if email fails
                    }
                }
            },
            { noAck: false }
        );
    } 
    catch (error) {
        console.error('❌ Error in consumer:', error);
    }
}


consumeOtpQueue();