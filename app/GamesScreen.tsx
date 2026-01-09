

//Mini Games

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';

export default function GamesScreen() {
  const router = useRouter();
  const [currentGame, setCurrentGame] = useState<'tile' | 'guess'>('tile');

  // Tile Matching Game
  const initialTiles = [
    '🍎','🍎','🍌','🍌','🍇','🍇','🍓','🍓',
    '🍍','🍍','🥝','🥝','🍑','🍑','🍒','🍒'
  ];
  const [tiles, setTiles] = useState(initialTiles.sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const handleTilePress = (index: number) => {
    if (flipped.includes(index) || matched.includes(index)) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (tiles[first] === tiles[second]) {
        setMatched([...matched, first, second]);
        setTimeout(() => setFlipped([]), 500);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const resetTiles = () => {
    setTiles([...initialTiles].sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
  };

  // Number Guessing Game
  const [targetNumber, setTargetNumber] = useState(Math.floor(Math.random() * 10) + 1);
  const [guess, setGuess] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [attempts, setAttempts] = useState(0);

  const handleGuess = (num: number) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setGuess(num);

    if (num === targetNumber) {
      setMessage(`🎉 Correct! You guessed ${targetNumber} in ${newAttempts} tries!`);
    } else if (num > targetNumber) {
      setMessage('❌ Too High! Try a smaller number.');
    } else {
      setMessage('❌ Too Low! Try a bigger number.');
    }
  };

  const resetGuessGame = () => {
    setTargetNumber(Math.floor(Math.random() * 10) + 1);
    setGuess(null);
    setMessage('');
    setAttempts(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Mini Games</Text>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/HomeScreen')}
      >
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      {/* Game Selector */}
      <View style={styles.gameSelector}>
        <TouchableOpacity
          style={[styles.selectorButton, currentGame === 'tile' && styles.selectedButton]}
          onPress={() => setCurrentGame('tile')}
        >
          <Text style={[styles.selectorText, currentGame === 'tile' && styles.selectedText]}>Tile Matching</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorButton, currentGame === 'guess' && styles.selectedButton]}
          onPress={() => setCurrentGame('guess')}
        >
          <Text style={[styles.selectorText, currentGame === 'guess' && styles.selectedText]}>Number Guess</Text>
        </TouchableOpacity>
      </View>

      {/* Tile Matching Game */}
      {currentGame === 'tile' && (
        <View style={styles.gameCard}>
          <FlatList
            data={tiles}
            numColumns={4}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.tile,
                  flipped.includes(index) || matched.includes(index)
                    ? styles.tileFlipped
                    : styles.tileHidden,
                ]}
                onPress={() => handleTilePress(index)}
              >
                <Text style={styles.tileText}>
                  {flipped.includes(index) || matched.includes(index) ? item : '❓'}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.resetButton} onPress={resetTiles}>
            <Text style={styles.resetText}>Reset Tiles 🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Number Guessing Game */}
      {currentGame === 'guess' && (
        <View style={styles.gameCard}>
          <Text style={styles.subtitle}>Guess a number between 1 and 10:</Text>
          <View style={styles.numberRow}>
            {[1,2,3,4,5,6,7,8,9,10].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.numberButton}
                onPress={() => handleGuess(num)}
              >
                <Text style={styles.numberText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {message ? <Text style={styles.resultText}>{message}</Text> : null}
          <TouchableOpacity style={styles.resetButton} onPress={resetGuessGame}>
            <Text style={styles.resetText}>Reset Game 🔄</Text>
          </TouchableOpacity>
          <Text style={styles.attemptsText}>Attempts: {attempts}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#7e8a6cff', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15 },

  backButton: { alignSelf: 'flex-start', marginBottom: 15, padding: 8 },
  backText: { fontSize: 22, color: '#1f6797ff', fontWeight: 'bold' },

  gameSelector: { flexDirection: 'row', marginBottom: 20, borderRadius: 12, overflow: 'hidden', backgroundColor: '#dfe6ed' },
  selectorButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  selectedButton: { backgroundColor: '#1abc9c' },
  selectorText: { fontWeight: 'bold', color: '#2c3e50' },
  selectedText: { color: '#fff' },

  gameCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    alignItems: 'center',
    marginBottom: 20,
  },

  subtitle: { fontSize: 18, marginBottom: 10, color: '#34495e', fontWeight: '600', textAlign: 'center' },

  // Tile Matching
  tile: {
    width: 60,
    height: 60,
    margin: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  tileHidden: { backgroundColor: '#bdc3c7' },
  tileFlipped: { backgroundColor: '#1abc9c' },
  tileText: { fontSize: 40 },

  resetButton: { marginTop: 15, backgroundColor: '#3498db', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  resetText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Number Guess
  numberRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  numberButton: { width: 50, height: 50, margin: 5, borderRadius: 12, backgroundColor: '#dfe6ed', justifyContent: 'center', alignItems: 'center' },
  numberText: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  resultText: { fontSize: 18, color: '#e74c3c', fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  attemptsText: { fontSize: 16, color: '#34495e', marginTop: 5 },
});






