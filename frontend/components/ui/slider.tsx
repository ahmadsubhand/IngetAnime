'use client';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Children, ReactNode, useState } from 'react';
import Slide, { CustomArrowProps } from 'react-slick';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Slider({
  children,
  slidesToShow = 2,
  slidesToScroll = 1,
  initialSlide = 0,
}: {
  children: ReactNode;
  slidesToShow: number;
  slidesToScroll: number;
  initialSlide?: number;
}) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const totalSlides = Children.count(children);
  const maxSlide = Math.max(0, totalSlides - slidesToShow);

  return (
    <div className="hidden sm:block pb-10 translate-x-2 slider-container">
      <Slide
        dots={true}
        speed={300}
        slidesToShow={slidesToShow}
        slidesToScroll={slidesToScroll}
        infinite={false}
        initialSlide={currentSlide}
        swipe={false}
        beforeChange={(_, newIndex) => {
          setCurrentSlide(newIndex);
        }}
        nextArrow={
          <NextArrow currentSlide={currentSlide} maxSlide={maxSlide} />
        }
        prevArrow={<PrevArrow currentSlide={currentSlide} />}
        variableWidth={true}
      >
        {children}
      </Slide>
    </div>
  );
}

type ArrowProps = CustomArrowProps & {
  currentSlide: number;
  maxSlide?: number;
};

function NextArrow({ onClick, currentSlide, maxSlide = 0 }: ArrowProps) {
  if (currentSlide >= maxSlide) return null;

  return (
    <Button
      type="button"
      onClick={onClick}
      className="absolute right-0 top-0 z-10 -translate-x-8 active:not-aria-[haspopup]:translate-y-4 translate-y-3.75 rounded-full shadow-xl"
    >
      <ChevronRight />
    </Button>
  );
}

function PrevArrow({ onClick, currentSlide }: ArrowProps) {
  if (currentSlide <= 0) return null;

  return (
    <Button
      type="button"
      onClick={onClick}
      className="absolute left-0 top-0 z-10 translate-x-4 active:not-aria-[haspopup]:translate-y-4 translate-y-3.75 rounded-full shadow-xl"
    >
      <ChevronLeft />
    </Button>
  );
}
