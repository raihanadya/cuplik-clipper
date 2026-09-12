const { ensureDir, cleanupFile } = require('../../src/utils/fileUtils');
const fs = require('fs');
const path = require('path');

describe('fileUtils', () => {
  const testDir = path.join(__dirname, '../temp');
  const testFile = path.join(testDir, 'test.txt');

  afterEach(() => {
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    if (fs.existsSync(testDir)) fs.rmdirSync(testDir);
  });

  describe('ensureDir', () => {
    it('should create directory if it does not exist', () => {
      expect(fs.existsSync(testDir)).toBe(false);
      ensureDir(testDir);
      expect(fs.existsSync(testDir)).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      fs.mkdirSync(testDir, { recursive: true });
      expect(() => ensureDir(testDir)).not.toThrow();
    });
  });

  describe('cleanupFile', () => {
    it('should delete file if it exists', () => {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(testFile, 'test');
      expect(fs.existsSync(testFile)).toBe(true);
      cleanupFile(testFile);
      expect(fs.existsSync(testFile)).toBe(false);
    });

    it('should not throw if file does not exist', () => {
      expect(() => cleanupFile('/nonexistent/file.txt')).not.toThrow();
    });

    it('should not throw if path is null or undefined', () => {
      expect(() => cleanupFile(null)).not.toThrow();
      expect(() => cleanupFile(undefined)).not.toThrow();
    });
  });
});
