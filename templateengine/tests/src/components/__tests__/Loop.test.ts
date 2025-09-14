import { testComponent } from './test-utils';

describe('Loop Component', () => {
  test('should render loop with array of strings', async () => {
    const template = `<Loop for="item in ['apple', 'banana', 'cherry']">
  Item: {{item}}
</Loop>`;
    const result = await testComponent(template);
    expect(result).toContain('apple');
    expect(result).toContain('banana');
    expect(result).toContain('cherry');
  });

  test('should render loop with array of objects', async () => {
    const template = `
<Loop for="person in people">
  Name: {{person.name}}, Age: {{person.age}}
</Loop>
  `;
    const variables2 = {
    people: [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 }
    ]
  };
    const result = await testComponent(template, variables2);
    expect(result).toContain('Name: Alice, Age: 30');
    expect(result).toContain('Name: Bob, Age: 25');
  });

  test('should render loop with numeric values', async () => {
    const template = '<Loop for="num in numbers">{{num}}</Loop>';
    const result = await testComponent(template, { numbers: [1, 2, 3, 4, 5] });
    expect(result).toContain('1');
    expect(result).toContain('2');
    expect(result).toContain('3');
    expect(result).toContain('4');
    expect(result).toContain('5');
  });

  test('should render nested loops', async () => {
    const template = `
<Loop for="category in categories">
  Category: {{category.name}}
  <Loop for="item in category.items">
    - {{item}}
  </Loop>
</Loop>
  `;
    const variables = {
      categories: [
        { name: 'Fruits', items: ['apple', 'banana'] },
        { name: 'Vegetables', items: ['carrot', 'broccoli'] }
      ]
    };
    const result = await testComponent(template, variables);
    expect(result).toContain('Category: Fruits');
    expect(result).toContain('Category: Vegetables');
    expect(result).toContain('- apple');
    expect(result).toContain('- banana');
    expect(result).toContain('- carrot');
    expect(result).toContain('- broccoli');
  });
});