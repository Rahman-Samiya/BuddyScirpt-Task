"use client";

import type { PropsWithChildren } from 'react';

type AuthLayoutProps = PropsWithChildren<{ variant?: 'login' | 'registration' }>

// Common layout to mirror the original HTML structure/styles
// Assumes assets are available under /assets from public folder
export default function AuthLayout({ children, variant = 'login' }: AuthLayoutProps) {
  const wrapperClass = variant === 'registration' ? '_social_registration_wrapper' : '_social_login_wrapper'
  const wrapperDivClass = variant === 'registration' ? '_social_registration_wrap' : '_social_login_wrap'
  return (
    <section className={`${wrapperClass} _layout_main_wrapper`}>
      {/* Background Shapes */}
      <div className="_shape_one">
        <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className={wrapperDivClass}>
        <div className="container">
          <div className="row align-items-center">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
