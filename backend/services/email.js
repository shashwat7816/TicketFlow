const nodemailer = require('nodemailer')

let transporter

async function init() {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount()

    // create reusable transporter object using the default SMTP transport
    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    })
    console.log('Email Service Initialized (Ethereal)')
}

init().catch(console.error)

async function sendBookingConfirmation(user, order, event) {
    if (!transporter) await init()

    const info = await transporter.sendMail({
        from: '"TicketFlow" <no-reply@ticketflow.com>',
        to: user.email,
        subject: `Your Ticket for ${event.name}`,
        text: `Hello ${user.name},\n\nYour booking for ${event.name} is confirmed!\n\nOrder ID: ${order._id}\nEvent: ${event.name}\nDate: ${new Date(event.date).toLocaleString()}\nVenue: ${event.venue}\n\nEnjoy the event!\nThe TicketFlow Team`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #3b82f6;">Booking Confirmed!</h1>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>Your booking for <strong>${event.name}</strong> has been confirmed.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
                    <p><strong>Venue:</strong> ${event.venue}</p>
                    <p><strong>Tickets:</strong> ${order.tickets}</p>
                </div>
                <p>Enjoy the event!</p>
                <p style="color: #6b7280; font-size: 12px;">The TicketFlow Team</p>
            </div>
        `,
    })

    console.log('Message sent: %s', info.messageId)
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    return info
}

module.exports = { sendBookingConfirmation }
