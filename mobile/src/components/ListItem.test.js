import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ListItem from './ListItem';

describe('ListItem', () => {
  it('renders title and subtitle and handles press', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ListItem title="Hello" subtitle="World" meta="Meta" onPress={onPress} />
    );

    fireEvent.press(getByText('Hello'));
    expect(onPress).toHaveBeenCalled();
    expect(getByText('World')).toBeTruthy();
    expect(getByText('Meta')).toBeTruthy();
  });
});
