const mongoose = require('mongoose');
const User = require('../../src/models/User');

describe('User model', () => {
  it('should have required fields', () => {
    const schema = User.schema;
    expect(schema.path('email').isRequired).toBeTruthy();
    expect(schema.path('password').isRequired).toBeTruthy();
  });

  it('should have unique email', () => {
    const schema = User.schema;
    expect(schema.path('email').options.unique).toBe(true);
  });

  it('should have default role as user', () => {
    const schema = User.schema;
    expect(schema.path('role').options.default).toBe('user');
  });

  it('should have default is_active as true', () => {
    const schema = User.schema;
    expect(schema.path('is_active').options.default).toBe(true);
  });

  it('should have timestamps', () => {
    const schema = User.schema;
    expect(schema.options.timestamps).toBe(true);
  });
});

describe('Session model', () => {
  const Session = require('../../src/models/Session');

  it('should have required fields', () => {
    const schema = Session.schema;
    expect(schema.path('userId').isRequired).toBeTruthy();
    expect(schema.path('sessionId').isRequired).toBeTruthy();
    expect(schema.path('layoutTemplate').isRequired).toBeTruthy();
  });

  it('should have unique sessionId', () => {
    const schema = Session.schema;
    expect(schema.path('sessionId').options.unique).toBe(true);
  });

  it('should have default status as queued', () => {
    const schema = Session.schema;
    expect(schema.path('status').options.default).toBe('queued');
  });

  it('should have valid layout template enum', () => {
    const schema = Session.schema;
    const enumValues = schema.path('layoutTemplate').enumValues;
    expect(enumValues).toContain('slide_pembicara');
    expect(enumValues).toContain('talking_head');
    expect(enumValues).toContain('slide_saja');
  });
});

describe('Clip model', () => {
  const Clip = require('../../src/models/Clip');

  it('should have required fields', () => {
    const schema = Clip.schema;
    expect(schema.path('sessionId').isRequired).toBeTruthy();
    expect(schema.path('clipId').isRequired).toBeTruthy();
    expect(schema.path('startTimeSeconds').isRequired).toBeTruthy();
    expect(schema.path('endTimeSeconds').isRequired).toBeTruthy();
    expect(schema.path('duration').isRequired).toBeTruthy();
  });

  it('should have unique clipId', () => {
    const schema = Clip.schema;
    expect(schema.path('clipId').options.unique).toBe(true);
  });

  it('should have default status as pending', () => {
    const schema = Clip.schema;
    expect(schema.path('status').options.default).toBe('pending');
  });

  it('should have default renderAttempts as 0', () => {
    const schema = Clip.schema;
    expect(schema.path('renderAttempts').options.default).toBe(0);
  });
});
