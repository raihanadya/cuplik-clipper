const { generateSRT } = require('../../src/services/renderService');
const fs = require('fs');
const path = require('path');

describe('renderService', () => {
  const testDir = path.join(__dirname, '../temp');
  const srtPath = path.join(testDir, 'test.srt');

  afterEach(() => {
    if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath);
    if (fs.existsSync(testDir)) fs.rmdirSync(testDir);
  });

  describe('generateSRT', () => {
    it('should generate valid SRT content from subtitles', () => {
      fs.mkdirSync(testDir, { recursive: true });

      const subtitles = [
        { word: 'Halo', start_time: 0, end_time: 0.5 },
        { word: 'dunia', start_time: 0.6, end_time: 1.2 },
      ];

      const result = generateSRT(subtitles, srtPath);

      expect(result).toContain('1\n00:00:00,000 --> 00:00:00,500\nHalo');
      expect(result).toContain('2\n00:00:00,600 --> 00:00:01,200\ndunia');
      expect(fs.existsSync(srtPath)).toBe(true);
    });

    it('should handle empty subtitles array', () => {
      fs.mkdirSync(testDir, { recursive: true });

      const result = generateSRT([], srtPath);

      expect(result).toBe('');
      expect(fs.existsSync(srtPath)).toBe(true);
    });

    it('should format timestamps correctly', () => {
      fs.mkdirSync(testDir, { recursive: true });

      const subtitles = [
        { word: 'test', start_time: 3661.5, end_time: 3662.75 },
      ];

      const result = generateSRT(subtitles, srtPath);

      expect(result).toContain('01:01:01,500 --> 01:01:02,750');
    });
  });
});
