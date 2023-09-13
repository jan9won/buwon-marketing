import { createTransport, type SendMailOptions } from 'nodemailer';

export type SimplifiedMailOptions = {
  from:     SendMailOptions['from'], 
  to:       SendMailOptions['to'],
  subject:  SendMailOptions['subject'],
  text:     SendMailOptions['text'],
  html:     SendMailOptions['html']
}

export class NodeMailerNaverSMTP {

  transporter: ReturnType<typeof createTransport>;
  VERBOSE: boolean = false;

  constructor (USER: string, PASS: string, VERBOSE: boolean = false) {
    this.VERBOSE = VERBOSE;
    this.transporter = createTransport({
      host: 'smtp.naver.com',
      port: 465,
      secure: true,
      auth: {
        type: 'login',
        user: USER,
        pass: PASS,
      },
      tls: {
        rejectUnauthorized: false,
      }
    });
  }

  verify(){
    return new Promise<Error|true>((resolve, reject) => {
      this.transporter.verify((err, success) => {
        if (err) {
          this.VERBOSE && console.error(err);
          reject(err);
        }
        if (success) {
          this.VERBOSE && console.log('Transporter verified');
          resolve(success);
        }
      })
    })
  }

  send (mailOptions: SimplifiedMailOptions) {
    return new Promise<Error|true>((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (error) => {
        if (error) {
          this.VERBOSE && console.error(error);
          reject(error);
        } else {
          this.VERBOSE && console.log('Successfully sent mail')
          resolve(true);
        }
      })
    })
  }
}

