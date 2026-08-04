import React from 'react'

const Table = () => {
  return (
    <div className='w-full overflow-x-auto'>
        <table className='table min-w-130 w-full text-left border-collapse rounded-lg shadow overflow-clip'>
            <thead>
                <tr className='bg-primary'>
                    <th>Lorem</th>
                    <th>Ipsum</th>
                    <th>Dolor</th>
                </tr>
            </thead>
            <tbody>
                <tr className=''>
                    <td colSpan="3">Lorem ipsum dolor sit amet</td>
                </tr>
            </tbody>
        </table>
    </div>
  )
}

export default Table