'use client';

import moment from 'moment';
import { useEffect, useState } from 'react';

const SponsorSkeleton = () => (
  <div className="mt-3 w-80 text-left sm:block border border-slate-700 bg-slate-900 rounded-md p-4 animate-pulse">
    <div className="h-4 w-16 bg-slate-700 rounded mb-2"></div>
    <div className="h-6 w-3/4 bg-slate-700 rounded mb-2"></div>
    <div className="h-4 w-full bg-slate-700 rounded mb-3"></div>
    <div className="space-y-2">
      <div className="h-4 w-2/3 bg-slate-700 rounded"></div>
      <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
      <div className="h-4 w-2/3 bg-slate-700 rounded"></div>
    </div>
    <div className="h-8 w-full bg-orange-900/50 rounded mt-4"></div>
  </div>
);

const SponsorCard = ({ sponsor }) => {
  const { type, link, title, description, features, callToAction } = sponsor;

  return (
    <div className="mt-3 w-80 text-left sm:block border border-slate-700 bg-slate-900 rounded-md p-4 ">
      <span className="text-xs mb-1 block text-slate-600">{type}</span>
      <a href={link} target="_blank" rel="nofollow" className="text-slate-300 transition-opacity hover:text-slate-200">
        <div className="text text-orange-600 mb-1 font-bold">{title}</div>
        <div className="text-sm text-slate-300 justify-start mb-2">{description}</div>
        {features.map((feature, index) => (
          <div className='opacity-70' key={index}>
            → <span className='text-sm '>{feature}</span>
          </div>
        ))}
        <span className="mt-4 mb-3 block w-52 w-full bg-orange-900 text-white mx-0 p-1 text-sm rounded text-center">
          {callToAction}
        </span>
      </a>
    </div>
  );
};

function RenderDatePart({ number, letter }: { number: number; letter: string }) {
  return (
    <div className="rounded-md p-[1px] overflow-hidden bg-gradient-to-b from-[#514b6130] to-[#514b6100]">
      <div className="py-2 px-3 rounded-md w-11 leading-4 flex items-center justify-center bg-gradient-to-b from-[#51269c40] to-[#DBB8BF10] backdrop-blur-md">
        <span className="m-0">{number}</span>
        <span>{letter}</span>
      </div>
    </div>
  );
}

function DatePartSkeleton() {
  return (
    <div className="rounded-md p-[1px] bg-slate-700 animate-pulse">
      <div className="w-9 h-7"></div>
    </div>
  );
}

function RenderCountdown() {
  const [isLoading, setLoading] = useState(true);
  let [now, setNow] = useState(moment().utc());
  let nextMondayNight;

  if (now.day() === 0 || (now.day() === 1 && now.hour() < 24)) {
    nextMondayNight = now.clone().endOf('d');

    if (now.day() === 0) {
      nextMondayNight = nextMondayNight.add(1, 'd');
    }
  } else {
    nextMondayNight = now.clone().startOf('isoWeek').add(1, 'week').day('Monday').endOf('d');
  }
  const diff = moment.duration(nextMondayNight.diff(now));

  const [days, setdays] = useState(Math.floor(diff.asHours() / 24));
  const [hours, setHours] = useState(diff.hours());
  const [minutes, setMinutes] = useState(diff.minutes());
  const [seconds, setSeconds] = useState(diff.seconds());

  useEffect(() => {
    setTimeout(() => {
      setNow(moment().utc());
      setSeconds(diff.seconds());
      setMinutes(diff.minutes());
      setHours(diff.hours());
      setdays(Math.floor(diff.asHours() / 24));
    }, 1000);
  }, [now]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return isLoading ? (
    <>
      <DatePartSkeleton />
      :
      <DatePartSkeleton />
      :
      <DatePartSkeleton />
      :
      <DatePartSkeleton />
    </>
  ) : (
    <>
      {days > 0 ? (
        <>
          <RenderDatePart number={days} letter="d" /> :{' '}
        </>
      ) : (
        <></>
      )}
      <RenderDatePart number={hours} letter="h" /> :
      <RenderDatePart number={minutes} letter="m" /> :
      <RenderDatePart number={seconds} letter="s" />
    </>
  );
}

const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch('https://d1gl9g4ciwvjfq.cloudfront.net/api/GetDevhuntAds');
        if (!response.ok) throw new Error('Failed to fetch sponsors');
        const data = await response.json();
        setSponsors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">Error loading sponsors</div>;
  }

  return (
    <div className="block sm:flex gap-2">
      {isLoading ? (
        <>
          <SponsorSkeleton />
          <SponsorSkeleton />
        </>
      ) : (
        sponsors.map((sponsor, index) => (
          <SponsorCard key={index} sponsor={sponsor} />
        ))
      )}
    </div>
  );
};

export default () => {
  return (
    <div className="flex border rounded-xl border-slate-800 bg-slate-800 p-5 flex-col gap-1 md:gap-2 items-center justify-end">
      <div className="px-2 flex flex-col items-center text-center gap-3">
        <h1 className="text-slate-200 text-xl font-bold">Find Best Dev Tools Voted by Developers!</h1>
        <p>
          <span className="text-2xl font-bold mb-4 text-orange-500">Vote Closing In: </span>
        </p>
        <div className="text-slate-100 flex gap-1 items-center">
          <RenderCountdown />
        </div>
        <div className="max-w-lg mt-2 text-slate-400">
          100k+ developers found Dev Tools here.
          <div className="inline mt-2 sm:block">
            See how{' '}
            <a
              className="underline transition-opacity hover:text-scale-1200"
              href="https://twitter.com/johnrushx/status/1661534492949872641"
            >
              it started
            </a>
            .
          </div>
          <SponsorsSection />
        </div>
      </div>
    </div>
  );
};