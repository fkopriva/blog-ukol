import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
    // let testAccount = await nodemailer.createTestAccount();
    // console.log('testAccount', testAccount);

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: "ufig7rv5wi4twlfm@ethereal.email",
            pass: "5eu7uSc4V5qvWjTFHU",
        },
    });

    let info = await transporter.sendMail({
        from: '"Fred Foo" <foo@example.com>',
        to: to, 
        subject: "Change password",
        html,
    });

    console.log("Message sent: %s", info.messsageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}