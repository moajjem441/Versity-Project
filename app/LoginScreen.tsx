



// app/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, TextInput, Text, StyleSheet, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, BackHandler 
} from 'react-native';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.replace('/HomeScreen');
    } catch (error: any) {
      let message = "Something went wrong. Try again.";
      if (
        error.code === "auth/invalid-email" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        message = "Email or Password is incorrect.";
      } else if (
        error.code === "auth/email-already-in-use" ||
        error.code === "auth/weak-password"
      ) {
        message = "Check your email or use a stronger password.";
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={['#1ABC9C', '#16A085']} style={styles.header}>
          <Text style={styles.headerTitle}>{isLogin ? "Welcome Back! " : "Create Account"}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAuth} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? "Login" : "Register"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.toggleText}>
              {isLogin ? "No account? Register" : "Have an account? Login"}
            </Text>
          </TouchableOpacity>

          {/* Exit Button */}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#e44b3aff', marginTop: 20 }]}
            onPress={() => BackHandler.exitApp()}
          >
            <Text style={styles.buttonText}>Exit App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow:1,
    backgroundColor:'#f0f4f8ff',
    justifyContent:'flex-start',
    alignItems:'center',
  },
  header: {
    width:'100%',
    paddingVertical:60,
    alignItems:'center',
    justifyContent:'center',
    borderBottomLeftRadius:30,
    borderBottomRightRadius:30,
  },
  headerTitle: {
    fontSize:28,
    color:'#fff',
    fontWeight:'bold',
  },
  card: {
    width:'90%',
    backgroundColor:'#fff',
    marginTop:-10,
    borderRadius:20,
    padding:25,
    shadowColor:'#000',
    shadowOpacity:0.05,
    shadowOffset:{width:0,height:5},
    shadowRadius:10,
    elevation:8,
  },
  input: {
    width:'100%',
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:12,
    paddingVertical:12,
    paddingHorizontal:15,
    fontSize:16,
    marginBottom:15,
    color:'#333',
    backgroundColor:'#f9f9f9'
  },
  button: {
    backgroundColor:'#1ABC9C',
    paddingVertical:15,
    borderRadius:12,
    alignItems:'center',
    marginTop:5,
    marginBottom:15,
  },
  buttonText: {
    color:'#fff',
    fontSize:18,
    fontWeight:'bold',
  },
  toggleText: {
    textAlign:'center',
    color:'#1ABC9C',
    fontSize:16,
    marginTop:6,
    marginBottom:8,
  }
});



