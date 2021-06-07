import { render, screen, fireEvent } from '@testing-library/react';
import { stripe } from '../../services/stripe';
import { mocked } from 'ts-jest/utils';
// import { signIn, useSession } from 'next-auth/client';
// import { useRouter } from 'next/router';
import Post, { getStaticProps } from '../../pages/posts';
import { getPrismicClient } from '../../services/prismic';

const posts = [{
  slug: 'my-new-post',
  title: 'My new post',
  excerpt: 'Post excerpt',
  updatedAt: 'March, 10'
}];

jest.mock('../../services/prismic');

describe('Posts page', () => {
  it('renders correctly', () => {
    render(
      <Post posts={posts}/>
    )
  
    expect(screen.getByText("My new post")).toBeInTheDocument();
  })

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: [
                { type: 'heading', text: 'My new post' }
              ],
              content: [
                { type: 'paragraph', text: 'Post excerpt' }
              ],
            },
            last_publication_date: '05-18-2021'
          }
        ]
      })
    } as any)

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'my-new-post',
            title: 'My new post',
            excerpt: 'Post excerpt',
            updatedAt: '18 de maio de 2021'
          }]
        }
      })
    )
  })
})
