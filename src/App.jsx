import React, { useEffect, useState } from 'react';
import Head from "./components/Header";//ヘッダー
import Foot from "./components/Footer";//フッター

export default function ArtGallery() {
  const [artworks, setArtworks] = useState([]); // アート作品用
  const [loading, setLoading] = useState(true); // ローディング状態
  const [category, setCategory] = useState('All'); // カテゴリ
  const [filterCategory, setFilterCategory] = useState('All'); // フィルタ済みカテゴリ

  useEffect(() => {
    // APIからオブジェクトIDリストを取得
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects')
      .then((response) => {
        if (!response.ok) {
          throw new Error('ネットワークエラーです!');
        }
        return response.json();
      })
      .then((data) => {
        const objectIDs = data.objectIDs;
        if (objectIDs && objectIDs.length > 0) {
          // ランダムに10個のオブジェクトIDを選ぶ
          const randomIDs = [];
          for (let i = 0; i < 10; i++) {
            const randomIndex = Math.floor(Math.random() * objectIDs.length);
            randomIDs.push(objectIDs[randomIndex]);
          }
          return Promise.all(
            randomIDs.map((id) =>
              fetch(
                `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
              ).then((res) => res.json())
            )
          );
        } else {
          throw new Error('オブジェクトIDが見つかりませんでした．');
        }
      })
      .then((artData) => {
        setArtworks(artData.filter((art) => art.primaryImage)); // 画像があるものだけ抽出
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching artworks:', error);
        setLoading(false);
      });
  }, []);

  // フィルタの更新
  const handleFilter = () => {
    setFilterCategory(category);
  };

  // フィルタ処理
  const filteredArtworks = artworks.filter((artwork) => {
    const matchCategory =
      filterCategory === 'All' ||
      artwork.department?.toLowerCase() === filterCategory.toLowerCase();
    return matchCategory;
  });

  return (
    <>
      
      <div>
        <Head />
      <article>
          <ul>
            <h1>Hi!</h1>
            <li>メトロポリタン美術館APIを利用しています．</li>
            <li>APIから提供される作品情報をランダムに10個取得し，画像ありの作品のみを表示します</li>
            <li>もし，ランダムな作品情報すべてに画像がない場合は「空のギャラリー」になります...</li>
            <li>ページのリロードをすると，他の作品がギャラリーに並びます</li>
          </ul>
        </article>


        <aside>
          <form>
            <div>
              <label htmlFor="category">Choose a category:</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All</option>
                <option>Paintings</option>
                <option>Sculptures</option>
                <option>Drawings</option>
              </select>
            </div>
            <div>
              <button type="button" onClick={handleFilter}>
                Filter results
              </button>
            </div>
          </form>
        </aside>

        <main className="art-gallery">
                {loading ? (
                    <p>Loading...</p>
                    ) : filteredArtworks.length > 0 ? (
                filteredArtworks.map((artwork, index) => (
                <div className="art-item" key={index}>
                    <img
                        src={
                        artwork.primaryImage ||
                        'https://via.placeholder.com/400x300?text=No+Image'
                        }
                    alt={artwork.title || 'No title'}
                    />
                    <h2>{artwork.title || 'Untitled'}</h2>
                    <p>Artist: {artwork.artistDisplayName || 'Unknown'}</p>
                    <p>Year: {artwork.objectDate || 'Unknown'}</p>
                    </div>
                    ))
                    ) : (
                    <p>No artworks found.</p>
                    )}
            </main>

        
        <Foot />
      </div>
      
    </>
  );
}
