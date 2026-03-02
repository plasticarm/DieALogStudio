import React from 'react';
import { RatedComic, ComicProfile } from '../types';
import { CachedImage } from './CachedImage';

interface RatingsPageProps {
  activeComic: ComicProfile | null;
  allComics: ComicProfile[];
  ratings: RatedComic[];
  onUpdateRating: (id: string, rating: number) => void;
  onDeleteRating: (id: string) => void;
  onPreviewImage: (url: string) => void;
  contrastColor: string;
  globalColor: string;
}

export const RatingsPage: React.FC<RatingsPageProps> = ({
  activeComic,
  allComics,
  ratings,
  onUpdateRating,
  onDeleteRating,
  onPreviewImage,
  contrastColor,
  globalColor
}) => {
  const [filterByActive, setFilterByActive] = React.useState(false);

  const filteredRatings = filterByActive && activeComic
    ? ratings.filter(r => r.comicProfileId === activeComic.id)
    : ratings;

  const getComicName = (profileId: string) => {
    return allComics.find(c => c.id === profileId)?.name || 'Unknown Series';
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden" style={{ backgroundColor: globalColor }}>
      <div className="flex justify-between items-end mb-8 border-b border-black/5 pb-4">
        <div>
          <h2 className={`text-5xl font-header tracking-tight uppercase ${contrastColor}`}>The Vault</h2>
          <p className={`${contrastColor} opacity-70 font-medium text-sm italic`}>
            {filterByActive && activeComic 
              ? `Reviewing submissions for ` 
              : `Reviewing all submissions across all series.`}
            {filterByActive && activeComic && <span className="font-black underline">{activeComic.name}</span>}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {activeComic && (
            <button 
              onClick={() => setFilterByActive(!filterByActive)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                filterByActive 
                  ? 'bg-amber-600 border-amber-500 text-white shadow-lg' 
                  : `bg-transparent border-black/10 ${contrastColor} hover:bg-black/5`
              }`}
            >
              {filterByActive ? 'Showing Active Series' : 'Show Active Series Only'}
            </button>
          )}
          <div className={`text-right ${contrastColor}`}>
            <span className="text-3xl font-black">{filteredRatings.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest block opacity-50">Total Submissions</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {filteredRatings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredRatings.map((rated) => (
              <div key={rated.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 flex flex-col transition-all hover:shadow-2xl hover:-translate-y-1">
                <div 
                  className="aspect-video relative overflow-hidden bg-slate-100 cursor-zoom-in"
                  onClick={() => onPreviewImage(rated.imageUrl)}
                >
                  <CachedImage src={rated.imageUrl} className="w-full h-full object-cover" alt={rated.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <i className="fa-solid fa-magnifying-glass-plus text-white text-3xl transform scale-50 group-hover:scale-100 transition-transform"></i>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteRating(rated.id); }}
                    className="absolute top-4 right-4 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow-lg transform translate-y-2 group-hover:translate-y-0 z-10"
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-full overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-slate-200">
                          {getComicName(rated.comicProfileId)}
                        </span>
                      </div>
                      <h3 className="font-header text-xl uppercase tracking-tight text-slate-800 truncate">{rated.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(rated.timestamp).toLocaleDateString()} • {new Date(rated.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => onUpdateRating(rated.id, star)}
                          className={`text-xl transition-all hover:scale-120 ${
                            star <= rated.rating ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          <i className={`fa-solid fa-star`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <i className="fa-solid fa-star-half-stroke text-9xl mb-8"></i>
            <h3 className="text-3xl font-header uppercase tracking-widest">No Rated Comics Yet</h3>
            <p className="text-sm font-medium italic mt-2">Save changes in the Testing Lab to submit a comic for rating.</p>
          </div>
        )}
      </div>
    </div>
  );
};
