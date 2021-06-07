import { render, screen, fireEvent } from '@testing-library/react';
import { stripe } from '../../services/stripe';
import { mocked } from 'ts-jest/utils';
import { signIn, useSession, getSession } from 'next-auth/client';
// import { useRouter } from 'next/router';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
  slug: 'my-new-post',
  title: 'My new post',
  content: '<p>Post excerpt</p>',
  updatedAt: 'March, 10'
};

jest.mock('../../services/prismic');
jest.mock('next-auth/client');

describe('Post page', () => {
  it('renders correctly', () => {
    render(
      <Post post={post}/>
    )
  
    expect(screen.getByText("My new post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
  })

  it('redirects user if no subscription is found', async () => {

    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce(null)
    
    const response = await getServerSideProps({ params: { slug: 'my-new-post' }} as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        })
      })
    )
  })

  it('loads initial data', async () => {

    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription'
    } as any)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My new post' }
          ],
          content: [
            { type: 'paragraph', text: 'Post content' }
          ]
        },
        last_publication_date: '05-18-2021'
      })
    } as any)

    const response = await getServerSideProps({ params: { slug: 'my-new-post' }} as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>Post content</p>',
            updatedAt: '18 de maio de 2021'
          }
        }
      })
    )
  })
})
