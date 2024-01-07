import amqp from 'amqplib';

import NotesService from './NotesService.js';
import MailSender from './MailSender.js';
import Listener from './listener.js';

import dotenv from 'dotenv';

const init = async () => {
  dotenv.config();

  const notesService = new NotesService();
  const mailSender = new MailSender();
  const listener = new Listener(notesService, mailSender);

  const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`

  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:notes', {
    durable: true,
  });

  channel.consume('export:notes', listener.listen, { noAck: true });
};

init();
