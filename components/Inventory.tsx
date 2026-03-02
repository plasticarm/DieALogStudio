import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Inventory = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'items'), where('uid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const itemsData = [];
        querySnapshot.forEach((doc) => {
          itemsData.push({ ...doc.data(), id: doc.id });
        });
        setItems(itemsData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    const storageRef = ref(storage, `images/${user.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision"});
    const prompt = "What is in this image?";
    const image = {inlineData: {data: await file.arrayBuffer(), mimeType: file.type}};
    const result = await model.generateContent([prompt, image]);
    const analysis = await result.response.text();

    await addDoc(collection(db, 'items'), {
      uid: user.uid,
      imageUrl,
      analysis,
      createdAt: new Date(),
    });

    setFile(null);
  };

  return (
    <div>
      <h2>Inventory</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <div>
        {items.map((item) => (
          <div key={item.id}>
            <img src={item.imageUrl} alt="inventory item" width="200" />
            <p>{item.analysis}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
